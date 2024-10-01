---
title: block write 상태 리팩토링
date: 2024-02-29T00:00:32.169Z
---

# 문제

- 상태가 변경되는 곳을 파악하기 어렵다.

# 현황

<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FsA9ITtWJvXJUJaV7s8PdTB%2F20240229-block-write-%25EC%2584%25A4%25EA%25B3%2584%3Ftype%3Dwhiteboard%26node-id%3D0%253A1%26t%3DaOBXpAsFkAvdLegI-1" allowfullscreen></iframe>
현재의 문제를 더 세밀하게 살펴보자면
- 연관된 컴포넌트가 너무 많다.
- 컴포넌트마다 역할이 불분명하다.
- 연관성 있는 상태들이 한 곳에서 관리되고 있지 않다.

그래서 이렇게 변경하려고 한다.

- 역할이 불분명한 컴포넌트는 다른 컴포넌트와 합친다.
  - BlcokFormWrap + BlcokFrom
- 컴포넌트 별로 역할을 재정의한다.
- context에 모든 상태를 모아 관리한다.

# 재설계

## 컴포넌트

- template
  - category를 변경한다.
- page
  - category에 따라 어떤 Form을 렌더링 할 지 결정한다.
  - edit) feed/btsFeed get 데이터 불러온 후 자식에게 전달
- ReleaseForm / BTSForm (공통)
  - form을 생성한다.
  - 기존 feed가 있을 경우 form 의 초기값을 해당 데이터로 설정한다.
  - form 값이 변경되면 전역 상태인 formData를 변경한다.
  - onSubmit 함수를 정의한다.
    ReleaseForm
  - onSubmit: feed 생성, category query 변경, 전역상태 feedState 업데이트,
    BTSForm
  - onSubmit: feed 생성(이때 relationship도 함께 생성), PreviewDialog 팝업 열기, 전역상태 btsFeedState 업데이트
- BlockForm
  - form 값을 받아서 렌더링한다.
  - onSubmit 을 실행한다.
  - RichTextEditor 값이 변경되면 form 안의 value에 이를 반영한다.
- PreviewDialog
  - form 을 생성한다.
  - form이 변경되면 전역 상태인 formData를 변경한다.
  - preview 이미지가 변경되면 form 의 값을 업데이트한다.
  - 제출 버튼을 누르면 feed, btsFeed의 공개 여부가 변경된다.
- BuildingSelect
  - 내 building 목록을 불러와 select 컴포넌트로 렌더링한다.

# 상태

- param
  - 'write'/'edit'
- query
  - step
- 전역

  - formData
  - btsFormData
  - feedState
  - btsFeedState

- 전역 (이걸 각각 만듦)
  - formState
  - feedState
  - schema
