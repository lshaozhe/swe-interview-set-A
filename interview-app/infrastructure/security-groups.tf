# Security Groups — TeamMetrics
#
# [CL-T1] App security group allows ALL inbound traffic from the internet
#         on ALL ports. Every port on the container is publicly accessible.
#
# [CL-T2] RDS security group allows inbound PostgreSQL (5432) from 0.0.0.0/0.
#         The database is directly reachable from the public internet.
#         Should only allow inbound from the app security group within the VPC.

resource "aws_security_group" "app" {
  name        = "teammetrics-app-sg"
  description = "App server security group"
  vpc_id      = var.vpc_id

  ingress {
    description = "All traffic from internet"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # Open to entire internet on all ports
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
    cidr_blocks = ["0.0.0.0/0"]   # DB accessible from public internet
    # Should be: source_security_group_id = aws_security_group.app.id
  }
}

# Correct approach (commented out for candidate to suggest):
# resource "aws_security_group_rule" "rds_from_app" {
#   type                     = "ingress"
#   from_port                = 5432
#   to_port                  = 5432
#   protocol                 = "tcp"
#   source_security_group_id = aws_security_group.app.id
#   security_group_id        = aws_security_group.rds.id
# }
