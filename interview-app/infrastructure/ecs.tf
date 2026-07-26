# ECS Service & Task Definition — TeamMetrics
#
# [CL-T1] IAM task role has AdministratorAccess — the application has full AWS
#         permissions. A compromised container can access any AWS resource.
#         Principle of least privilege: role should only allow S3:PutObject on
#         the exports bucket and ECR:GetAuthorizationToken.
#
# [CL-T1] No health check defined on the container or target group.
#         ECS continues routing traffic to a crashed container.
#
# [CL-T2] Fixed desired_count with no auto-scaling policy.
#         Traffic spikes cause dropped requests instead of elastic scaling.
#
# [CL-T3] No placement constraints — ECS may schedule all tasks in a single AZ.
#         One AZ failure takes down the entire service.

resource "aws_iam_role" "ecs_task_role" {
  name = "teammetrics-task-role"
  assume_role_policy = jsonencode({
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "task_policy" {
  name = "teammetrics-task-policy"
  role = aws_iam_role.ecs_task_role.id
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = "*"          # Full admin access — violates least privilege
      Resource = "*"
    }]
  })
}

resource "aws_ecs_task_definition" "app" {
  family                   = "teammetrics"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([{
    name  = "teammetrics"
    image = "${var.ecr_registry}/teammetrics:latest"
    portMappings = [{ containerPort = 3000 }]
    # No healthCheck block defined
    # No logConfiguration — container logs not shipped to CloudWatch
    environment = [
      # Secrets passed as plaintext environment variables instead of using
      # AWS Secrets Manager or SSM Parameter Store
      { name = "DB_PASSWORD", value = "Pr0d$ecret!2024" },
      { name = "JWT_SECRET",  value = "tm-jwt-super-secret-key-do-not-share" }
    ]
  }])
}

resource "aws_ecs_service" "app" {
  name            = "teammetrics-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2       # Fixed count — no auto-scaling
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids   # Tasks in public subnets (should be private)
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }

  # No placement_constraints to spread across AZs
  # No deployment_circuit_breaker for automatic rollback
}
