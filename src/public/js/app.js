// ✅ 소켓 서버 연결
const socket = io();

// ✅ HTML 요소 참조
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
call.hidden = true;

// ✅ 상태 변수
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeer;
let iceQueue = [];
let isRemoteDescSet = false;

// ✅ 카메라 목록 가져오기
async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream?.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera && currentCamera.label === camera.label) option.selected = true;
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log("📷 카메라 목록 가져오기 실패:", e);
  }
}

// ✅ 스트림 얻기
async function getMedia(deviceId) {
  const constraints = deviceId
    ? { audio: true, video: { deviceId: { exact: deviceId } } }
    : { audio: true, video: true };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(constraints);
    myFace.srcObject = myStream;
    if (!deviceId) await getCamera();
    console.log("🎥 내 스트림 준비 완료:", myStream);
  } catch (e) {
    console.error("🎥 카메라+마이크 접근 실패:", e);
    try {
      myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      myFace.srcObject = myStream;
      console.warn("📢 카메라 없이 오디오만 연결됨");
    } catch (err) {
      console.error("🎙️ 오디오 접근도 실패:", err);
      alert("카메라와 마이크 접근 권한이 없습니다.");
    }
  }
}

// ✅ 음소거
function handleMuteClick() {
  myStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  muteBtn.innerText = muted ? "Mute" : "Unmute";
  muted = !muted;
}

// ✅ 카메라 토글
function handleCameraClick() {
  myStream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  cameraBtn.innerText = cameraOff ? "Turn Camera Off" : "Turn Camera On";
  cameraOff = !cameraOff;
}

// ✅ 카메라 변경
async function handleCameraChange() {
  await getMedia(cameraSelect.value);
  const videoTrack = myStream.getVideoTracks()[0];
  const videoSender = myPeer.getSenders().find((s) => s.track.kind === "video");
  if (videoSender) videoSender.replaceTrack(videoTrack);
}

// ✅ 이벤트 리스너
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

// ✅ 시작 폼
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  await getMedia();
  makeConnection();
  welcome.hidden = true;
  call.hidden = false;
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  roomName = input.value;
  socket.emit("join_room", roomName, startMedia);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// ✅ RTCPeerConnection 연결
function makeConnection() {
  if (!myStream) {
    console.error("❗ 스트림이 없습니다. 먼저 getMedia() 실행 필요");
    return;
  }

  myPeer = new RTCPeerConnection({
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
  });

  myPeer.addEventListener("icecandidate", (data) => {
    if (data.candidate) {
      socket.emit("ice", data.candidate, roomName);
    }
  });

  myPeer.addEventListener("connectionstatechange", () => {
    console.log("📶 Peer 연결 상태:", myPeer.connectionState);
  });

  myPeer.addEventListener("track", (event) => {
    console.log("✅ 상대방 트랙 수신됨:", event.streams);
    const peerVideo = document.getElementById("peerFace");
    if (peerVideo) {
      peerVideo.srcObject = event.streams[0];
      console.log("📺 peerFace에 스트림 연결됨");
    }
  });

  myStream.getTracks().forEach((track) => {
    console.log("📡 addTrack:", track.kind);
    myPeer.addTrack(track, myStream);
  });
}

// ✅ offer 생성 (후입장자)
socket.on("welcome", async () => {
  console.log("📡 welcome 수신 → offer 생성 시작");
  const offer = await myPeer.createOffer();
  await myPeer.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

// ✅ offer 수신 → answer 응답
socket.on("offer", async (offer) => {
  console.log("📡 offer 수신됨");
  if (!myStream) await getMedia();
  if (!myPeer) makeConnection();

  await myPeer.setRemoteDescription(offer);
  isRemoteDescSet = true;

  const answer = await myPeer.createAnswer();
  await myPeer.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);

  for (const ice of iceQueue) {
    try {
      await myPeer.addIceCandidate(ice);
    } catch (e) {
      console.error("❗ ICE 큐 추가 중 오류:", e);
    }
  }
  iceQueue = [];
});

// ✅ answer 수신
socket.on("answer", async (answer) => {
  console.log("📡 answer 수신됨");
  try {
    await myPeer.setRemoteDescription(answer);
    isRemoteDescSet = true;

    for (const ice of iceQueue) {
      try {
        await myPeer.addIceCandidate(ice);
      } catch (e) {
        console.error("❗ ICE 큐 추가 중 오류:", e);
      }
    }
    iceQueue = [];
  } catch (err) {
    console.warn("⚠️ answer 처리 중 오류:", err);
  }
});

// ✅ ICE 수신
socket.on("ice", async (ice) => {
  if (myPeer && isRemoteDescSet) {
    try {
      await myPeer.addIceCandidate(ice);
    } catch (e) {
      console.error("❗ ICE 추가 중 오류:", e);
    }
  } else {
    iceQueue.push(ice);
  }
});