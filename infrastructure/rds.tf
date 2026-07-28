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
