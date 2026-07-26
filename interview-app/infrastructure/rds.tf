# RDS PostgreSQL — TeamMetrics
#
# [CL-T2] storage_encrypted = false — data at rest is unencrypted.
#         Fails SOC2, ISO 27001, and most enterprise compliance requirements.
#
# [CL-T2] backup_retention_period = 0 — automated backups disabled.
#         A corrupted or accidentally deleted table cannot be recovered.
#
# [CL-T3] No read replica — all reads and writes hit the primary instance.
#         Heavy dashboard queries contend with transactional writes.
#         Primary failure means zero database availability.

resource "aws_db_instance" "main" {
  identifier        = "teammetrics-prod"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100

  db_name  = "teammetrics_prod"
  username = "app_user"
  password = "Pr0d$ecret!2024"   # Hardcoded password in IaC

  # Security issues
  storage_encrypted       = false   # No encryption at rest
  backup_retention_period = 0       # Backups disabled
  deletion_protection     = false   # Can be deleted with one command
  publicly_accessible     = true    # Database reachable from the internet

  # Performance issues
  # No: performance_insights_enabled
  # No: monitoring_interval for Enhanced Monitoring
  # No: read replica (separate aws_db_instance with replicate_source_db)

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true  # No snapshot taken on deletion
}
