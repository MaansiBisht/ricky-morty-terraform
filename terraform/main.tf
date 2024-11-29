terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = "ricky-morty-terraform"
  region  = "us-central1"
  zone    = "us-central1-c"
  credentials = "ricky-morty-terraform-640e89cdc899.json"
}

# Variables
variable "project_id" {
  default = "ricky-morty-terraform"
}
variable "instance_name" {
  default = "mongodb-instance"
}
variable "firewall_name" {
  default = "mongodb-firewall"
}
variable "disk_size" {
  default = 30 # Size in GB for block storage
}
variable "zone" {
  default = "us-central1-c"
}

# Create a VPC network
resource "google_compute_network" "vpc_network" {
  name = "mongodb-vpc"
}

# Firewall rule to allow traffic on MongoDB port (27017)
resource "google_compute_firewall" "mongodb_firewall" {
  name    = var.firewall_name
  network = google_compute_network.vpc_network.self_link

  allow {
    protocol = "tcp"
    ports    = ["27017"]
  }

  # Allow access from specific IPs or 0.0.0.0/0 for public access (for demo)
  source_ranges = ["0.0.0.0/0"]
}

# resource "google_compute_firewall" "deny_all_other" {
#   name     = "deny-all-other"
#   network  = google_compute_network.vpc_network.self_link
#   priority = 65534  # Higher number = lower priority

#   deny {
#     protocol = "all"
#   }
# }

# Create a persistent disk for MongoDB data
resource "google_compute_disk" "mongodb_disk" {
  name  = "mongodb-disk"
  type  = "pd-standard" 
  size  = var.disk_size
  zone  = var.zone
}

# Creating backup disk for MongoDB data
resource "google_compute_disk" "mongodb_backup_disk" {
  name  = "mongodb-backup-disk"
  type  = "pd-standard"  # Standard disk is sufficient for backups
  size  = 10            
  zone  = var.zone
}

# Create Compute Engine instance
resource "google_compute_instance" "mongodb_instance" {
  name         = var.instance_name
  machine_type = "f1-micro"  # Free tier eligible machine type
  zone         = var.zone
  boot_disk {
    initialize_params {
      image = "debian-11-bullseye-v20241112"
    }
  }
  attached_disk {
    source = google_compute_disk.mongodb_disk.id
    mode = "READ_WRITE"
  }
  attached_disk {
    source = google_compute_disk.mongodb_backup_disk.id
    mode   = "READ_WRITE"
  }
  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    sudo apt update && sudo apt install -y mongodb
    sudo systemctl enable mongodb
    sudo systemctl start mongodb
  EOT
}

# Output the instance IP
output "instance_ip" {
  value = google_compute_instance.mongodb_instance.network_interface[0].access_config[0].nat_ip
}