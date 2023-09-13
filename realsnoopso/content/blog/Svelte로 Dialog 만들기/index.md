---
title: 디바이스 너비 변경시 Dialog 위치 고정 버그
date: 2022-10-02T00:00:32.169Z
description: Svelte로 Dialog 만들기
---

![Screen Recording 2023-09-04 at 6 33 20 PM](https://user-images.githubusercontent.com/96381221/267786839-a1f50b9d-e6d3-49ca-886b-aef916e02a96.gif)

Add Label이라는 버튼을 클릭하면 라벨 선택 Dialog가 열린다. 이때 Dialog 의 위치가 아래와 같은 케이스에서 동적으로 변경되지 않는 문제가 발생했다.

1. 디바이스의 너비가 변경될 때
2. LNB가 접고 펼쳐지면서 내부 Container의 너비가 변경될 때

# 문제 해결

위 문제를 해결하기 위해서 두가지 상태를 감지해야 했다.
device의 너비값, 그리고 내부 container의 너비값이였다.

우선 device 의 너비값을 받기 위해 reactive statement 내부에 innerWidth를 지정하여 innerWidth가 변경이 될 때마다 실행이 되도록 해주었다.

```ts
<script>
...
let labelSelector;

$: {
innerWidth;

options.subscribe(async (opt) => {
	const { parent, labels, handlers: _handlers } = opt;
	coordinate = parent.getBoundingClientRect();
	if (coordinate && labelSelector) {
		labelSelector.style.top = `${coordinate.y + coordinate.height + 8}px`;
		const isOverflow = coordinate.x + 320 > innerWidth;
		if (isOverflow) {
		labelSelector.style.right = `16px`;
		} else {
		labelSelector.style.left = `${coordinate.x}px`;
		}
	}
}
</script>


<svelte:window bind:innerWidth />

<div class="label-selector-container">
	<div class="label-selector-bg" on:click={close} />
	<div
		class="label-selector"
		class:newlabel={showNewLabel}
		bind:this={labelSelector}
	...

```

아래는 문제가 해결되고 난 후의 영상이다. 디바이스의 움직임에 따라 반응하는 것을 확인할 수 있다.

![Screen Recording 2023-09-04 at 6 53 44 PM](https://user-images.githubusercontent.com/96381221/267788578-893f5b56-ded5-4433-a7aa-c2b9601f8e2d.gif)
(참고로 그림자 잔상이 남는 것은 gif로 변환되면서 발생한 문제이다. 코드에서의 이상은 없다)
