# Noom 🎥

Zoom Clone with Node.js, WebRTC and WebSocket

[![Node.js](https://img.shields.io/badge/node.js-18.x-brightgreen)](https://nodejs.org/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-blue)](https://webrtc.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📚 목차

1. [프로젝트 소개](#프로젝트-소개)
2. [설치 방법](#설치-방법)
3. [기술 스택](#기술-스택)
4. [핵심 개념](#핵심-개념)
5. [실행 방법](#실행-방법)
6. [참고 사항](#참고-사항)
7. [라이선스](#라이선스)

---

## 📘 프로젝트 소개

이 프로젝트는 **Zoom 클론**으로, WebRTC와 WebSocket을 활용하여 실시간 화상 회의 기능을 제공합니다.  
Node.js 기반의 서버와 Socket.io를 사용하여 브라우저 간 영상/오디오/채팅 연결을 구현합니다.

---

## ⚙ 설치 방법

```bash
# 개발 환경 설정
npm i nodemon -D                          # 개발 중 자동 리로딩
npm i @babel/core @babel/cli @babel/node -D   # ES6+ 문법을 Node.js에서 사용 가능
npm i @babel/preset-env -D               # 최신 자바스크립트 문법 지원
npm i express                            # 백엔드 서버 프레임워크
npm i pug                                # 템플릿 엔진

# 실시간 통신
npm i ws                                 # 순수 WebSocket
npm i socket.io                          # WebSocket 추상화 라이브러리

# 외부 터널링 테스트용
npm i localtunnel
npm i -g localtunnel                     # 로컬 서버를 외부에서 접속 가능하게 함
```

##🛠 기술 스택
Node.js + Express: 백엔드 서버

Pug: 템플릿 엔진

WebSocket / Socket.io: 실시간 통신

WebRTC: P2P 영상 및 오디오 통신

LocalTunnel: 외부 접속 테스트용

## 🧠 핵심 개념
🔁 HTTP vs WebSocket
HTTP는 Stateless하며 서버는 클라이언트를 기억하지 못함.

WebSocket은 양방향 지속 연결을 유지하여 서버도 클라이언트에게 메시지를 보낼 수 있음.

## 🧩 Socket.io
WebSocket 기반 실시간 프레임워크.

브라우저가 WebSocket을 지원하지 않아도 폴백 제공.

신뢰성과 빠른 속도 보장.

Room / Socket ID 개념으로 방 구분 가능.

여러 사용자가 같은 방에 접속하여 채팅, 영상 통화 가능.

```
// 예시
io.sockets.adapter.rooms      // 현재 서버의 모든 방 리스트

```

🗺 Map 개념
Socket.io 내부 구조는 Map 기반으로 작동.

각 방(Room)은 고유한 key 값으로 식별됨.

Socket ID는 클라이언트의 고유 연결 식별자.

🔌 Adapter
서버 간 연결을 가능하게 해줌.

여러 서버를 클러스터링해도 같은 방에서 통신 가능.

🚀 실행 방법

```bash
# 개발 서버 실행
npm run dev
# 또는 Babel을 사용한 실행
npx babel-node src/server.js
⚠ 참고 사항
Peer 수가 너무 많을 경우 P2P 구조에서는 불안정해질 수 있음.

이 경우 SFU(Selective Forwarding Unit) 서버 도입이 필요할 수 있음.

LocalTunnel을 사용하여 실제 외부 기기에서 테스트 가능:
```

```bash
lt --port 3000 --subdomain yourname
```

📄 라이선스
MIT License
본 프로젝트는 MIT 라이선스를 따릅니다. 자유롭게 사용하되, 출처를 명시해주세요.
