# INTERVIEWER-ANNOTATION-START
# [CL-07 · T2 · security] No encryption at rest, deletion protection or final snapshot; the instance is publicly accessible.
#     Look near: storage_encrypted       = false
# [CL-08 · T2 · reliability] Automated backups are disabled.
#     Look near: backup_retention_period = 0
# [CL-09 · T3 · reliability] One instance, no read replica or Multi-AZ: heavy dashboards contend with writes and failure means downtime.
#     Look near: instance_class    = "db.t3.medium"
# [DSO-16 · T1 · security] The database password is committed in Terraform (and ends up in state).
#     Look near: password = "Pr0d$ecret!2024"
# INTERVIEWER-ANNOTATION-END
# RDS PostgreSQL for TeamMetrics

resource "aws_db_instance" "main" {
  identifier        = "teammetrics-prod"
  engine            = "postgres"
  engine_version    = "15.3"
  instance_class    = "db.t3.medium"
  allocated_storage = 100

  db_name  = "teammetrics_prod"
  username = "app_user"
  password = "Pr0d$ecret!2024"

  storage_encrypted       = false
  backup_retention_period = 0
  deletion_protection     = false
  publicly_accessible     = true

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true
}
