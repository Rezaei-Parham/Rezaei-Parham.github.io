---
layout: post
title:  "SDN-Based Vehicular Edge Computing"
date:   2026-07-07 15:19:35 +00:00
image: /images/project-pics/transparent/sdn-vehicle.png
categories: Sharif
course: "Real-Time Systems"
author: "Parham Rezaei"
code: https://github.com/Rezaei-Parham/SDN-Vehicle
---
I built a two-timescale vehicular edge computing simulator where mobile provider vehicles are placed with convex optimization and client vehicles learn task-offloading decisions with masked CTDE-PPO.

The system parses a SUMO-style mobility trace, discretizes the road area into a hexagonal grid, moves provider vehicles between high-coverage grid centers, and evaluates task offloading to local compute, mobile providers, fixed edge servers, or relay paths. It tracks delay, packet loss, missed deadlines, blind spots, and learned policy rewards across multiple vehicle-density scenarios.

The project also includes baseline comparisons, PPO convergence plots, provider-location heatmaps, and a renderer for simulation videos showing vehicle movement, provider relocation, task links, and server coverage.
