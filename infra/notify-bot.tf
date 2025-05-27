# terraform/main.tf

# Terraformとプロバイダーのバージョン指定
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWSプロバイダーの設定
provider "aws" {
  region = "ap-northeast-1"
}

# データソース: 最新のAmazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# データソース: デフォルトVPC
data "aws_vpc" "default" {
  default = true
}

# データソース: デフォルトサブネット
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# セキュリティグループ
resource "aws_security_group" "ec2_sg" {
  name_prefix = "katamichi-go-notify-sg"
  vpc_id      = data.aws_vpc.default.id

  # SSH接続を許可
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP接続を許可
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS接続を許可
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # アウトバウンド通信を全て許可
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "katamichi-go-notify-security-group"
  }
}

# キーペア（既存のキーペアを使用する場合）
resource "aws_key_pair" "ec2_key" {
  key_name   = "katamichi-go-notify-key"
  public_key = file("./public.pem")
}

# EC2インスタンス
resource "aws_instance" "ec2_instance" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  key_name      = aws_key_pair.ec2_key.key_name

  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  associate_public_ip_address = true

  # ルートボリューム設定
  root_block_device {
    volume_type = "gp3"
    volume_size = 8
    encrypted   = true
  }

  tags = {
    Name        = "katamichi-go-notify"
  }
}

# terraform/outputs.tf

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.ec2_instance.id
}

output "instance_public_ip" {
  description = "EC2 instance public IP"
  value       = aws_instance.ec2_instance.public_ip
}

output "instance_private_ip" {
  description = "EC2 instance private IP"
  value       = aws_instance.ec2_instance.private_ip
}

output "instance_public_dns" {
  description = "EC2 instance public DNS"
  value       = aws_instance.ec2_instance.public_dns
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.ec2_sg.id
}