---
title: 가상화와 KVM
draft: false
date: 2026-02-23
updated: 2026-02-23
tags:
  - VM
  - Virtualization
  - KVM
---
## 1. 가상화(Virtualization)란?

> **하나의 물리적 하드웨어 자원**을 논리적으로 분할  
> **여러 개의 독립적인 실행 환경(=가상머신)** 을 동시에 운영하는 기술

- 물리 서버 1대를 여러 대의 서버처럼 사용
- 각 서버 → 독립적 OS와 애플리케이션 실행
- 등장 배경 → 하드웨어 효율적으로 사용하기 위한 기술

---

## 2. 가상화 핵심 개념

### 0. 물리 머신 vs 가상 머신

- Host (호스트) → 실제 하드웨어 설치된 물리 서버
- Guest (게스트) → 가상화 기술로 만든 논리적 서버
- VM (Virtual Machine) → Guest OS + 가상 하드웨어

### 1. 하이퍼바이저 (Hypervisor)

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223.png)

- 물리 하드웨어와 가상 머신 사이에서 자원을 중재 (소프트웨어 계층)
- 역할
	- CPU 스케줄링
	- 메모리 할당
	- 디스크 I/O 중재
	- 네트워크 가상화

- 유형
	1. Type 1 (Bare-metal Hypervisor)
		- 특징
			- OS 없이 하드웨어 위에 직접 설치
			- 성능 우수
			- 안정성 높음
			- 서버/클라우드 환경에 사용
		- ex)
			- KVM (Linux Kernel 기반)
			- Xen
			- ESXi
		- 구조
			```
			[ Hardware ]  
			      ↓     
			[ Hypervisor ]  
			      ↓    
			[ VM1 | VM2 | VM3 ]
			```
			
	2. Type 2 (Hosted Hypervisor)
		- 특징
			- 일반 OS 위에서 실행
			- 설치 간편
			- 성능은 Type 1보다 낮음
			- 개발/테스트/교육용
		- ex)
			- VirtualBox
			- VMware Workstation
		- 구조
			```
			[ Hardware ]  
			     ↓    
			[ Host OS ]   
			     ↓    
			[ Hypervisor ]  
			     ↓   
			[ VM ]
			```

### 2. 가상 머신 내부 구조

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-1.png)

가상 하드웨어 (구성 요소)
- vCPU - 물리 CPU 논리적 분할
- vMemory - 실제 RAM 일부를 할당
- vDisk - 파일 형태 디스크
- vNIC - 가상 네트워크 인터페이스

> 실제 하드웨어 접근 → 모두 하이퍼바이저를 통해 간접 처리

### 3. 전가상화 vs 반가상화

#### 3-1. 전가상화 (Full Virtualization)
- Guest OS 수정 X
- 실제 하드웨어처럼 완전한 가상 환경 제공
- 성능 오버헤드 존재
- ex)
	- 초기 VMware
	- QEMU

#### 3-2. 반가상화 (Paravirtualization)
- Guest OS 수정 O
- 하이퍼바이저와 직접 통신
- 성능 향상
- ex)
	- Xen Paravirtualized Mode

---

## 3. KVM (Kernel-based Virtual Machine)

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-2.png)

**KVM 기본 동작 방식**

1. Guest OS 수정 필요 X
	- Linux, Windows, BSD 등 기존 OS 그대로 실행
	- 커널 패치 X → 전가상화의 핵심

2. CPU 하드웨어 가상화 기능 사용
	- ex)
		- Intel VT-x
		- AMD-V
	- CPU가 게스트의 특권 명령어 직접 처리
	- 하이퍼바이저가 완전한 가상 하드웨어 제공

> KVM 은 전가상화


**전가상화 이면서 반가상화 인 이유**

![](Experience/MGC_SA_Bootcamp/4_KVM_Docker/img/20260223-3.png)

- **Virtio 드라이버**
	- KVM에서 성능향상을 위해 반가상화 드라이버 사용
	- 디스크, 네트워크, 메모리 I/O용 반가상화 장치 드라이버
	- Guest OS 내부에 드라이버 설치 O
	- 하이퍼바이저와 직접 통신 경로 제공

> 가상화 방식 vs 성능 최적화 방식  
> - 가상화 방식 → VM을 어떻게 실행시키는가  
> - I/O 처리 방식 → VM이 하드웨어를 어떻게 쓰는가  
> KVM은 둘을 혼합해서 사용


**KVM**
- 전가상화
- Guest OS 수정 불필요
- CPU 가상화 → VT-x / AMD-V
- I/O 최적화 → Virtio (반가상화 드라이버)

>[!note]
>KVM 은 전가상화 하이퍼바이저  
>디스크·네트워크 성능 향상을 위해 반가상화 드라이버 함께 사용
