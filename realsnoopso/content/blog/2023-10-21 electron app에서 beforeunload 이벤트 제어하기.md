---
title: electron app에서 beforeunload 이벤트 제어하기
date: 2023-10-21T00:00:32.169Z
---

# beforeunload?

beforeunload는 DOMContentLoaded, load, unload와 같은 이벤트들과 함께 html 문서의 생명주기 이벤트에 해당한다. 이름에서 알 수 있듯, html이 unload 되기 직전에 발생하는 것이 beforeunload이다. 특히 사용자가 사용자를 떠나려할 때, 변경되지 않은 사항들을 저장했는지 확인시켜줄 때 사용한다.

```js
window.onbeforeunload = function () {
  return false;
};
```

위와 같이 코드를 작성하면 아래와 같이 브라우저에 내장된 대화창이 실행되게 된다.

<img width="372" alt="Screenshot 2023-10-21 at 1 34 38 PM" src="https://user-images.githubusercontent.com/96381221/277087891-1b864bc8-5b68-4db7-8df8-9cec64d3ccbb.png">
기존에는 return 값에 문자를 반환하면 해당 문자열이 위의 팝업 문구에 반영이 되었으나, 여러 남용된 사례들로 인해 현재는 디폴트 메세지만 보여지게 되었다고 한다.

# electron에서는 경고 창이 노출되지 않는다

현재 내가 작업 중인 환경은 다음과 같다: electron 을 사용해 chromium을 띄운 후, 별도로 배포된 web을 해당 chromium에 띄운다. 그런데 문제는, electron을 사용하는 환경에서는 onbeforeunload 이벤트가 일반 브라우저와 동일하게 동작하지 않았다.

아래의 스크린샷에서 상단의 빨간색 종료 버튼을 누르거나 새로고침을 실행했을 경우 일반적인 브라우저에서는 onbeforeunload가 발생하면서 대화 창이 보이게 되지만, chromium 은 이와는 다르게 대화 창이 노출되지 않았다.

<img width="541" alt="Screenshot 2023-10-21 at 1 56 31 PM" src="https://user-images.githubusercontent.com/96381221/277088669-a9fbebc3-6f11-40e7-964d-d4aa825b2dd3.png">

# 브라우저 내부에서 이벤트 처리하기

electron에서 이 이벤트를 제어하는 방법도 있었겠지만, 내가 담당했던 코드가 아니기도 했고, 브라우저 내부에서도 충분히 제어 가능할 것 같아 브라우저 내부에서 제어할 방법을 찾아보기로 했다.

우선 기본적으로 작성해 본 코드는 다음과 같다. 여기서 이상한 점은, 일반적인 browser에서는 deprecated 되었다고 하는 .returnValue 메소드가 쓰인다는 점이다. 테스트를 해본 결과, 최신 방식처럼 return에 반환 값을 지정하는 경우 닫기 버튼을 눌렀을 때 브라우저가 beforeunload 를 감지하지 못하고 그대로 닫히지만, .returnValue를 사용했을 경우 의도대로 닫는 이벤트가 실행되지 않고 중단되는 것을 확인할 수 있었다.

```jsx
function beforeCloseBrowser(event: BeforeUnloadEvent) {
  overlay.open(({ isOpen, close }) => (
    <BeforeCloseDialog
      resetEdited={resetEdited}
      onSave={onSave}
      onClose={close}
      isOpen={isOpen}
      event="close-browser"
    />
  ));
  event.returnValue = "";
}

window.addEventListener("beforeunload", beforeCloseBrowser);
```

위와 같이 작성했을 때까지는 문제가 없었는데, 이번에는 새로고침 이벤트가 말썽이었다. 위와 같이 작성했을 경우 새로고침 이벤트는 실행되지 않았다. 고민을 하다가, keydown 이벤트로 새로고침이 발생하는 상황들을 제어하면 beforeunload 이벤트보다 keydown 이벤트가 먼저 실행되기에 충분히 제어가 가능해보였다.

```jsx
function beforeRefresh(event: KeyboardEvent) {
  const isMac = navigator.userAgent.includes("Mac");
  if (
    event.key === "F5" ||
    (event.ctrlKey && event.key === "r") ||
    (isMac && event.metaKey && event.key === "r")
  ) {
    event.preventDefault();
    overlay.open(({ isOpen, close }) => (
      <BeforeCloseDialog
        resetEdited={resetEdited}
        onSave={onSave}
        onClose={close}
        isOpen={isOpen}
        event="refresh"
      />
    ));
  }
}
```

위는 새로고침을 제어하는 코드이다. 우선 mac인지 아닌지 여부를 확인, 새로고침에 해당하는 키 값을 감지하여 keydown 이 실행되면 dialog를 노출하도록 했다.

결과적으로는 다음과 같이 코드를 작성하였다. 닫기 버튼을 누르는 경우, control+f를 눌러 새로고침을 하는 경우 모두 정상적으로 동작하는 것을 확인할 수 있었다.

```js
useEffect(() => {
  if (!isEdited) return;

  function beforeCloseBrowser(event: BeforeUnloadEvent) {
    overlay.open(({ isOpen, close }) => (
      <BeforeCloseDialog
        resetEdited={resetEdited}
        onSave={onSave}
        onClose={close}
        isOpen={isOpen}
        event="close-browser"
      />
    ));
    event.returnValue = "";
  }

  function beforeRefresh(event: KeyboardEvent) {
    const isMac = navigator.userAgent.includes("Mac");
    if (
      event.key === "F5" ||
      (event.ctrlKey && event.key === "r") ||
      (isMac && event.metaKey && event.key === "r")
    ) {
      event.preventDefault();
      overlay.open(({ isOpen, close }) => (
        <BeforeCloseDialog
          resetEdited={resetEdited}
          onSave={onSave}
          onClose={close}
          isOpen={isOpen}
          event="refresh"
        />
      ));
    }
  }

  document.addEventListener("keydown", beforeRefresh);
  window.addEventListener("beforeunload", beforeCloseBrowser);

  return () => {
    document.removeEventListener("keydown", beforeRefresh);
    window.removeEventListener("beforeunload", beforeCloseBrowser);
  };
}, [isEdited]);
```

![Screen Recording 2023-10-21 at 2 31 50 PM](https://user-images.githubusercontent.com/96381221/277089903-fe818b2e-87f8-4c00-9d05-07357e6a5b24.gif)
