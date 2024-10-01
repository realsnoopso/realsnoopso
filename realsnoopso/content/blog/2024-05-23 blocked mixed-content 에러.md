---
title: blocked mixed-content 에러
date: 2024-05-23T00:00:32.169Z
---

# 문제

<img width="600" alt="스크린샷 2024-05-23 오전 10 08 31" src="https://gist.github.com/assets/96381221/fd0cd84d-2a91-41e2-8620-efcc621170e3">

로컬에서 테스트를 했을 때는 네트워크 요청이 정상적이었는데, 프로덕션에서 확인하니 네트워크 상태가 (blocked:mixed-content) 로 유지되며 응답조차 오지 않는 것을 확인했다.

# 원인

프로덕션 환경은 HTTPS 프로토콜을 사용하는데, API에서는 HTTP 프로토콜을 사용해서 해당 에러가 발생.

# 왜 이런 일이 발생할까

결론부터 말하자면 크롬 브라우저의 보안 정책 때문이다.

HTTPS 프로토콜을 사용하는 웹 페이지에서 HTTP 프로토콜을 사용하는 리소스(예: API)를 요청하면 "mixed content" 에러가 발생한다. 이는 보안상의 이유로, HTTPS 페이지가 보안 연결을 통해 전송되므로 페이지 내의 모든 리소스 또한 같은 수준의 보안을 유지해야 한다는 원칙 때문이다.

웹 브라우저는 사용자의 데이터 보호를 위해 이러한 요청을 차단한다. HTTPS는 데이터를 암호화하여 중간자 공격으로부터 보호하는 반면, HTTP는 암호화되지 않아 데이터가 노출될 위험이 있다.

해결 방법은 모든 API 요청을 HTTPS를 통해 처리하도록 변경하는 것이다. 이를 위해 서버 설정을 HTTPS로 업그레이드하거나, 이미 HTTPS를 지원하는 경우 API 요청 URL을 HTTPS 프로토콜을 사용하도록 수정해야 한다.

# 직접 해결해 보자.

백엔드와 논의를 해본 후 인프라 학습 겸 내가 직접 API에 HTTPS 프로토콜을 적용해 보기로 하였다.

## 현황

현재의 백엔드는 Elastic Beanstalk 이라는 AWS 서비스를 사용하고 있으며, 단일 인스턴스를 사용 중이고 로드밸런서는 사용하지 않았다. 도메인을 붙이지 않고 엘라스틱 빈스톡에서 제공한 URL을 그대로 API 주소로 사용 중인 상황이었다. 해당 주소의 Security group에는 443이 허용되어 있지 않은 상황이었다.

## Record가 바라보는 경로 수정하기

- Route 53에 접속
- api.citti.io 가 바라보는 경로를 기존 프로젝트 URL 에서 새 프로젝트 URL로 수정하였다.

## Security group Inbound rules 추가하기

- EC2 - Security groups에 접속
- Elastic Beanstalk 에 배포된 인스턴스의 Security group 을 확인, 해당 Security group에 Inbound rules 를 추가하여 443 포트 (HTTPS) 여는 것을 허용했다.

## 어플리케이션에 443 포트로 요청이 왔을시, 3000 로 리다이렉션
