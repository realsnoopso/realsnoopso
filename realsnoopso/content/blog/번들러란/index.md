---
title: 번들러(Bundler)란?
date: "2022-12-29T00:00:32.169Z"
description: 번들러에 대해서 알아보자.
---

## 번들러가 대체 뭐지?

어느날 회사에서 빌드 속도를 높이기 위해 Rollup을 Vite라는 번들러로 교체하겠다고 했다. 번들러가 대체 뭐지? 나는 개인 프로젝트를 하면서 번들러라는 것을 한번도 설치해본 적이 없었다.

번들러는 여러 개로 모듈화된 자바스크립트 파일을 하나로 합치는 즉, ‘bundle’ 해주는 도구이다. 브라우저는 모듈화된 자바스크립트는 읽지 못하기 때문에 브라우저에서 코드를 실행하려면 반드시 번들러가 필요하다. 그런데 어떻게 내 개인 프로젝트에서는 번들러를 설치하지 않고도 작업된 코드를 브라우저에서 확인할 수 있었던 걸까?

React 프로젝트를 세팅하기 위해 사용했던 Create React App에서 그 이유를 찾을 수 있었다. 여기에 Webpack이 내장되어있었던 것이다.

![](https://velog.velcdn.com/images/realsnoopso/post/cb2e4dfb-11bb-4567-9df4-4831999914e9/image.png)

> package-lock.json 파일에서 webpack 이 내장되어 있는 것을 확인할 수 있다.

회사에서 썼던 Svelte의 경우에는 Rollup이라는 번들러를 자동으로 설치해주고 있었다. 즉, 라이브러리를 쓰는 경우 번들러의 존재를 인지할 기회가 거의 없다.

하지만 바닐라 자바스크립트를 쓰는 경우는 다르다. 라이브러리를 사용하지 않으니 번들러도 수동으로 설치해야 한다. 혹은 성능상의 이유 등으로 기존에 쓰고 있던 번들러를 교체하고 싶을 경우도 있을 것이다.

## 번들러의 여러 기능들

번들러는 번들링 뿐만 아니라 여러 다양한 기능들을 포함한다.

1. Bundling: 하나의 번들된 파일을 만들어 배포와 실행이 가능하게 한다.
2. Transpile: 브라우저가 이해할 수 없는 확장자(tsx, jsx 등)을 js 파일로 변환해준다. process.env… 등의 Environment variable 의 값을 치환해주는 것도 번들러다.
3. Dependencies: ‘node_moudles’에 패키지들을 설치해준다. ‘node_modules’의 버전과 패키지의 버전이 일치하는지 확인하고 관리한다.
4. Automating tasks: linting, testing, building 등을 자동화해준다.

이외에도 여러 기능들을 제공하며 이는 번들러별로 다르다.

## 어떤 번들러를 써야 할까?

![](https://velog.velcdn.com/images/realsnoopso/post/1448349c-4638-456b-894c-a80373718a5c/image.png)

1년간의 npm 트렌드를 보면 위와 같은 그래프를 확인할 수 있다. Webpack의 점유율이 압도적이다. Rollup과 Esbuild 가 그 뒤를 이으며 Vite가 그다음을 순위임을 확인할 수 있다. 각 번들러별 특장점은 다음과 같다.

1. Webpack: 에셋 매니지먼트, 코드 분할, 트랜스파일링 등을 포함한 오래된 번들러로, 레퍼런스가 많고 안정적이지만 설정이 복잡하고 느리다.
2. Rollup: 번들링과 최적화에 초점을 맞춰 설정이 비교적 쉽고 Webpack보다 가볍게 사용할 수 있는 번들러이다.
3. Esbuild: go로 작성된 번들러로, 코드 분할, 트랜스파일링 등을 포함하고 있으며, build 속도가 Webpack과 Rollup에 비해 100배 정도 빠르다. 하지만 설정이 어렵다는 점이 있다.
4. Vite: Vue.js의 제작자인 Evan You가 개발한 최근에 출시된 번들러로, Dev 서버 실행 속도를 개선하기 위해 시작되었다. 의존성과 소스 코드를 나눠서 속도를 개선하고, 코드 수정 시 자동으로 재빌드하는 HMR(Hot Module Replacement) 기능을 제공한다. 설정이 쉬우며, 가볍고 빠르다.

회사에서 Rollup을 Vite로 교체 후 3분 넘게 걸리던 Dev 서버 실행 속도가 즉각적으로 실행된다고 느낄 만큼 현저히 빨라진 경험을 했다. 좋은 경험을 받았기에 앞으로도 개인 프로젝트의 번들러는 Vite를 선택할 것이다.

### 참고

- Vite 공식 문서 (https://vitejs.dev/guide/why.html)
- Vite 조금 더 뜯어보기 (https://www.youtube.com/watch?v=UdTD_NAWxyE)
