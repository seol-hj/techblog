---
title: AWS 클라우드 기술과 아키텍처 설계
draft: false
tags:
  - AWS
  - Cloud
---

> [!info]
> EC2, VPC, S3, IAM 기초 실습  
> Well-Architected Framework  
> AutoScaling, ELB 고가용성 구성  
> Serverless, 멀티 티어 아키텍처 실습  
> 하이브리드 연결 (VPN, DX)  
> Transit Gateway, Control Tower  
> 데이터 보안 (KMS), 비용 최적화


---

## 📌 실습

#### Basic

- [VPC Interface Endpoint + SSM Session Manager](Experience/MGC_SA_Bootcamp/7_AWS/21_VPCE_SSM.md)
- [NAT Instance 설정 방법](Experience/MGC_SA_Bootcamp/7_AWS/22_NAT_Instance.md)
- [Network Baseline 구축](Experience/MGC_SA_Bootcamp/7_AWS/23_Network_Baseline.md)
- [Bastion Host 이용](Experience/MGC_SA_Bootcamp/7_AWS/24_Bastion_Host.md)
- [ELB](Experience/MGC_SA_Bootcamp/7_AWS/25_ELB.md)
- [ASG + ALB](Experience/MGC_SA_Bootcamp/7_AWS/26_ASG_ALB.md)
- [EBS](Experience/MGC_SA_Bootcamp/7_AWS/27_EBS.md)
- [S3](Experience/MGC_SA_Bootcamp/7_AWS/28_S3.md)
- [Aurora PostgreSQL](Experience/MGC_SA_Bootcamp/7_AWS/29_Aurora_PostgreSQL.md)

#### Adv

- [EC2 IAM Role](Experience/MGC_SA_Bootcamp/7_AWS/30_IAM_Role.md)
- [S3 Access Control](Experience/MGC_SA_Bootcamp/7_AWS/31_S3_AC.md)
- [CloudFront + S3 Website Endpoint](Experience/MGC_SA_Bootcamp/7_AWS/32_CF_S3.md)
- [CloudFront + S3 Origin 배포](Experience/MGC_SA_Bootcamp/7_AWS/33_CF_S3_Origin.md)
- [SQS](Experience/MGC_SA_Bootcamp/7_AWS/60_SQS.md)

#### Serverless

- [Lambda](Experience/MGC_SA_Bootcamp/7_AWS/34_Lambda.md)
- [API Gateway](Experience/MGC_SA_Bootcamp/7_AWS/35_API_Gateway.md)
- [Lambda + DynamoDB](Experience/MGC_SA_Bootcamp/7_AWS/36_Lambda_DynamoDB.md)

#### IaC

- [CloudFormation - 3-Tier Architecture](Experience/MGC_SA_Bootcamp/7_AWS/37_CloudFormation.md)
- [CloudFormation - ALB + ASG 3-Tier](Experience/MGC_SA_Bootcamp/7_AWS/38_CloudFormation_ALB_ASG.md)

#### Network & Security

- [HTTPS 구현 (ACM)](Experience/MGC_SA_Bootcamp/7_AWS/39_ACM.md)
- [VPC Peering](Experience/MGC_SA_Bootcamp/7_AWS/40_VPC_Peering.md)
- [Client VPN](Experience/MGC_SA_Bootcamp/7_AWS/41_Client_VPN.md)
- [Cross Region VPC Peering](Experience/MGC_SA_Bootcamp/7_AWS/42_Cross_Region_VPC_Peering.md)
- [Transit Gateway](Experience/MGC_SA_Bootcamp/7_AWS/43_Transit_Gateway.md)
- [Site-to-Site VPN - 1 터널](Experience/MGC_SA_Bootcamp/7_AWS/44_Site-to-Site_VPN_1.md)
- [Site-to-Site VPN - 2 터널](Experience/MGC_SA_Bootcamp/7_AWS/45_Site-to-Site_VPN_2.md)
- [Gateway Endpoint](Experience/MGC_SA_Bootcamp/7_AWS/46_Gateway_Endpoint.md)
- [Interface Endpoint](Experience/MGC_SA_Bootcamp/7_AWS/47_Interface_Endpoint.md)
- [Route53 - Routing Policy](Experience/MGC_SA_Bootcamp/7_AWS/48_Route53.md)
- [AWS Backup](Experience/MGC_SA_Bootcamp/7_AWS/49_AWS_Backup.md)
- [WAF](Experience/MGC_SA_Bootcamp/7_AWS/50_WAF.md)
- [WAF Logging - Kinesis Data Firehose](Experience/MGC_SA_Bootcamp/7_AWS/51_WAF_Kinesis.md)
- [WAF + Athena](Experience/MGC_SA_Bootcamp/7_AWS/52_WAF_Athena.md)
- [KMS + Secrets Manager](Experience/MGC_SA_Bootcamp/7_AWS/53_KMS_Secrets_Manager.md)

#### Container

- [EKS](Experience/MGC_SA_Bootcamp/7_AWS/54_EKS.md)
- [EKS - LB](Experience/MGC_SA_Bootcamp/7_AWS/55_EKS_LB.md)
- [EKS - EBS CSI 기반 동적 볼륨 프로비저닝](Experience/MGC_SA_Bootcamp/7_AWS/56_EKS_EBS.md)
- [EKS - ALB Ingress](Experience/MGC_SA_Bootcamp/7_AWS/57_EKS_ALB.md)
- [EKS - EFS CSI 기반 공유 스토리지](Experience/MGC_SA_Bootcamp/7_AWS/58_EKS_EFS.md)
- [EKS - Pod Idenitty로 S3 접근](Experience/MGC_SA_Bootcamp/7_AWS/59_EKS_SA.md)
- [ECR](Experience/MGC_SA_Bootcamp/7_AWS/61_ECR.md)