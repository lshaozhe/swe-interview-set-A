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
      Action   = "*"
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
    environment = [
      { name = "DB_PASSWORD", value = "Pr0d$ecret!2024" },
      { name = "JWT_SECRET",  value = "tm-jwt-super-secret-key-do-not-share" }
    ]
  }])
}

resource "aws_ecs_service" "app" {
  name            = "teammetrics-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }
}
