resource "aws_security_group" "app" {
  name        = "teammetrics-app-sg"
  description = "App server security group"
  vpc_id      = var.vpc_id

  ingress {
    description = "All traffic from internet"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "teammetrics-rds-sg"
  description = "RDS security group"
  vpc_id      = var.vpc_id

  ingress {
    description = "PostgreSQL from internet"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
