---
title: Duration Picker 컴포넌트 제작기
date: 2022-09-11T00:00:32.169Z
---

입사한지 한달 정도 지나 회사에 적응할 무렵, 나에게 기존 캘린더 컴포넌트를 리팩토링하여 기간을 선택하는 컴포넌트로 개편하는 태스크가 주어졌다.

회사 내부에 이미 존재했던 Calender라는 라이브러리는 의존성을 최대한 줄이기 위해 바닐라 자바스크립트를 사용했다. 이를 리팩토링하는 과정이었기에 동일하게 바닐라 자바스크립트를 사용하였다. 이를 설치하여 사용하는 메인 레포지토리에서는 Svelte를 사용하였다.

회사에 날짜를 선택하는 달력 라이브러리가 있었지만, 이 라이브러리에 기간을 선택하는 옵션은 존재하지 않았다. 나에게 주어진 미션은 이 기간을 설정하는 옵션을 해당 라이브러리에 추가하는 것이었다.

# 어떤 props을 둘까?

하나의 날짜만 선택하는 기능도 여전히 존재해야하는 만큼, props를 어떻게 둘지에 대한 고민이 필요했다. 또한, 라이브러리를 외부에 공개할 정도로 퀄리티를 높이는 것이 목표였기에 다양한 설정 옵션들을 제공할 수 있어야 했다.

```js
<lago-calendar
  data-calendar-type="duration"
  data-controls="next-only"
  data-no-date-preview
  data-today-as-end-date
  data-display-year-month={currMonth}
  data-date={duration}
/>
```

각각의 항목은 다음과 같은 옵션으로 사용되도록 작업했다.

- data-calendar-type: "duration" 일 경우, 기간을 선택할 수 있는 달력이 된다. 설정하지 않을 경우 날짜를 선택하는 달력이 된다.
- data-controls: "none|all|next-only|prev-only" 로, 상단의 두 화살표의 표시 여부를 결정한다.
- data-no-date-preview: 다음 달 날짜를 미리 볼 수 있게 할지 여부를 결정한다.
- data-today-as-end-date: 오늘 이전의 날짜만 선택할 수 있게 만든다.
- data-display-year-month: 어떤 월을 표기할 것인지 결정한다.
- data-date: 날짜 혹은 기간을 선택한다.

# Custom Element의 사용

바닐라 자바스크립트에서 컴포넌트 생성을 위해 Custom Element 를 사용하였다. 또한, 상태 관리를 위해 observedAttributes라는 내장 메소드를 사용하였다.

observedAttributes 안에 지정된 prop은 변경되면, 변경을 감지하는 attributeChangedCallback 메소드를 호출하게 된다. 이 메소드는 컴포넌트를 재렌더링하는 함수인 this.update()를 호출한다.

```javascript
class LagoCalendar extends HTMLElement {

	static get observedAttributes() {
		return ['data-date', 'display-year-month'];
	}

	attributeChangedCallback() {
		this.update();
	}
	...
}

...
customElements.define("lago-calender", LagoCalendar);
```

# 컴포넌트 외부에서 이벤트 감지하기

lago-calender라는 단일 element에서 세가지 유형의 click 이벤트가 발생해야 한다.

1. 이전 캘린더로 이동
2. 다음 캘린더로 이동
3. 날짜 선택

즉, 단순히 click 이벤트를 감지하는 것으로는 분기 처리가 어렵다. event를 발생시킨 target을 감지하는 방법도 있지만, 코드 가독성을 위해 dispatch 를 통해 커스텀 이벤트로 분리해주었다.

```javascript
// Vanilla Javascript
this.dispatchEvent(
  new CustomEvent("prevmonth", {
    bubbles: true,
    composed: true,
  })
);

this.dispatchEvent(
  new CustomEvent("nextmonth", {
    bubbles: true,
    composed: true,
  })
);

this.dispatchEvent(
  new CustomEvent("select", {
    bubbles: true,
    composed: true,
    detail: result,
  })
);
```

```javascript
// Svelte
<lago-calendar
  on:select={selectDuration}
  on:prevmonth={clickPrevMonthCalender}
  on:nextmonth={clickNextMonthCalender}
/>
```

# 배운 것

입사 전에는 React를 집중적으로 학습했기에, Vanilla JavaScript와 Svelte 를 사용하는 환경에 쉽게 적응하지 못했다. 다양한 라이브러리와 프레임워크에 빠르게 적응하기 위해 근간이 되는 Javascript를 익히는 것이 중요하다는 깨달음을 얻을 수 있었다.
