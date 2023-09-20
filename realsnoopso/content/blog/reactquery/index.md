---
title: React Query 도입기
date: 2023-9-20T00:00:32.169Z
description: useInfiniteQuery를 이용해 무한스크롤을 구현해보자.
---
# 도입 계기
기존에는 Custom Hook을 직접 만들어 fetch을 했지만, useEffect에서 fetch를 실행할 수 밖에 없다는 단점이 있었다.  React 공식 문서를 살펴보면 useEffect를 통한 fetch에는 Effect가 서버에서 실행되지 않아서 발생하는 문제점들이 존재한다.

1. 데이터를 미리 로드할 수 없다.
2. 캐시가 불가능하다.

 위와 같은 문제가 대표적이며, 조건 경합과 같은 버그가 발생할 수 있다. 때문에 React 공식 문서에서도 Fecth 관련 라이브러리를 따로 설치하여 이용할 것을 추천하고 있다.

공식 문서에 언급된 대안은 다음과 같다. 

1. Framework(Next.js, Remix 등..)를 사용하는 경우 내장 fetching 매커니즘
2. React Query
3. useSWR
4. React Router 6.4

우선 현재의 프로젝트에서 Framework를 따로 사용하고 있지 않아 1번은 제외하였다. 그리고 React Router의 경우 캐시 기능을 지원하지 않아 제외했다. useSWR의 경우 가벼운 것이 장점이지만, Infinite Queries와 Devtools를 지원하지 않았다. 최종적으로 프로젝트에 React Query를 도입하는 것으로 결정하였다.

# React Query 도입하기
## 1. 기본 설정
React query를 사용하기 위해서는 queryClient를 provider에 넣어준 후 App 자체를 감싸주어야 한다. 이 때, Suspense를 이용할 예정이므로 option에 suspense를 true로 설정해주었다. 이 설정이 없으면 Suspense에서 React Query의 처리 상태를 캐치할 수 없다. 추가로, devtools의 사용을 위해 ReactQueryDevtools을 코드에 심어 두었다.

```jsx
export const App = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				suspense: true,
			},
		},
	});
	
	return (
		<QueryClientProvider client={queryClient}>
			....
			<ReactQueryDevtools position="bottom-right" panelPosition="right" />
		</QueryClientProvider>
	);
};
```

## 2. ReactQuerySuspense 컴포넌트 제작
이제 Error와 Loading 상태 처리를 도와줄 ReactQuerySuspense라는 컴포넌트를 만들어보려고 한다. 코드는 아래와 같이 작성하였다.

```jsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null, errorInfo: null };
	}
	
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({error, errorInfo,});
	}
	
	render() {
		if (this.state.errorInfo) {
			return this.props.fallbackRender({
				error: this.state.error!,
				resetErrorBoundary: () =>
					this.setState({ error: null, errorInfo: null }),
				});
		}
		return this.props.children;
	}
}

export const ReactQuerySuspense: FC<ReactQuerySuspenseProps> = ({children}) => {
	return (
		<QueryErrorResetBoundary>
			{({ reset }) => (
				<ErrorBoundary
				fallbackRender={({ error, resetErrorBoundary }) => (
					<Error
					onClick={() => {
					resetErrorBoundary();
					reset();
					}}>	
						{error.message || '에러가 발생했습니다. 다시 시도해주세요'}
					</Error>
				)}>	
					<Suspense fallback={<Loading />}>{children}</Suspense>
				</ErrorBoundary>
			)}
		</QueryErrorResetBoundary>
	);
};
```

각 컴포넌트의 역할은 다음과 같다. 
1. QueryErrorResetBoundary: react-query 내부에서 발생하는 에러를 캐치하고 관리한다.
2. ErrorBoundary: JS 내부에서 발생하는 에러를 캐치하고 관리한다.
3. Suspense: 하위 컴포넌트에서 비동기 처리가 완료될 때까지 fallback을 보여준다.

## 3. useInfiniteQuery 사용하기

기본 설정 및 토대가 되는 컴포넌트를 모두 완성했으니 이제 사용만이 남았다. 무한스크롤 구현을 위해 react query에서 제공하는 useInfiniteQuery 를 사용할 것이다. useInfiniteQuery는 무한스크롤 구현에 특화된 훅으로 다음 데이터를 호출할 때 사용할 수 있는 콜백 함수 fetchNextPage와 다음 페이지 존재 여부를 확인할 수 있는  hasNextPage 와 같은 property를 갖고 있다. 이를 이용해서 무한스크롤을 구현해보자.

```jsx
import { ListItem, Loading } from '@components/commons';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver/useIntersectionObserver';
import { getItemListAPI, convertItemListToListItems } from '@services/items/items';
import * as S from '../HomePageStyle';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ReactQuerySuspense } from '@components/commons/ReactQuerySuspense/ReactQuerySuspense';

export const HomeList = ({ categoryIdx, userMainLocationIdx }) => {
	return (
		<ReactQuerySuspense>
			<Contents
			categoryIdx={categoryIdx}
			userMainLocationIdx={userMainLocationIdx}
			/>
		</ReactQuerySuspense>
	);
};

const Contents = ({ categoryIdx, userMainLocationIdx }) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	
	const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
		useInfiniteQuery(
		['home-items', { categoryIdx, userMainLocationIdx }],
		({ pageParam = 0 }) => {
			return getItemListAPI(pageParam, categoryIdx);
		},
		{
			getNextPageParam: (lastPage, allPages) => {
				if (lastPage.hasNext) {
					return allPages.length;
				}
				return undefined;
			},
			select: (data) => {
				const newPages = data.pages.map((page) =>
					convertItemListToListItems(page)
				);
		
				return { ...data, pages: newPages };
			},
			staleTime: 10000,
			cacheTime: 12000,
		}
	);
	
	const handleIntersection = (entries: IntersectionObserverEntry[]) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) {
				fetchNextPage();
			}
		});
	};

	const setTarget = useIntersectionObserver(handleIntersection);
	
	return (	
	<>
		{data?.pages.flatMap((pageData) => pageData.items).map((item) => (
			<ListItem key={item.itemIdx} {...item} onClick={() =>
					navigate(`/item/${item.itemIdx}`, { state: pathname })
				}
>			</ListItem>
		))}
		<S.ObserverTarget ref={setTarget}></S.ObserverTarget>
		{isFetchingNextPage && <Loading height="40px" />}
	</>
	);
};
```

위 코드에서 왜 HomeList 와 Contents를 각각의 컴포넌트로 분리한 것인지 의문이 들 수도 있을 것이다. 이유는 단순하다. ReactQuerySuspense가 해당 쿼리를 감싸고 있지 않게 되기 때문이다. 따라서 반드시 분리가 필요했다.

```jsx
export const HomeList = ({ categoryIdx, userMainLocationIdx }) => {

	useInfiniteQuery(
		['home-items', { categoryIdx, userMainLocationIdx }],
		({ pageParam = 0 }) => {
			return getItemListAPI(pageParam, categoryIdx);
		},
		... // 여기에서 useInfiniteQuery를 사용하게 되면 ReactQuerySuspense가 해당 쿼리를 감싸고 있지 않으므로 발생한 에러를 캐치할 수 없게 된다.
	
	return (
		<ReactQuerySuspense>
			<Contents
			categoryIdx={categoryIdx}
			userMainLocationIdx={userMainLocationIdx}
			/>
		</ReactQuerySuspense>
	);
};
```

이제 useInfiniteQuery의 각 property에 대해서 하나하나 알아보자.

- data: `{ pageParams, pages }` 와 같은 형태를 갖고 있으며, 이 pages라는 배열 안에 비동기 함수의 반환 값이 순차적으로 들어간다. 
- isFetchingNextPage: fetchNextPage 콜백이 실행되고 있는 중이라면 true 값을 반환한다. 
- fetchNextPage: 다음 페이지의 데이터를 가져오기 위한 비동기 함수이다.
- hasNextPage: 다음 페이지 존재 여부를 알려준다.

다음으로는 useInfiniteQuery의 parameter에 대해서 살펴보자.
- queryName: 해당 쿼리의 이름을 설정할 수 있다. 
- queryQuery: data.pages에 반환할 값을 결정하는 비동기 함수이다. 여기에서 원하는 API를 호출해주면 된다.
- options
	- getNextPageParam: data.pageParams에 어떤 값을 넣어줄지 결정할 수 있는 함수이다.
	-  select: queryQuery에서 반환된 값의 형식을 변경하고 싶을 때 사용하는 함수이다. 
	- staleTime: stale의 반댓말은 freshness인데, 말 그대로 데이터의 신선도가 얼만큼 유지될지 결정하는 값이다. 예를 들어 staleTime이 3초로 설정되어 있으면, 이전까지는 캐시된 데이터를 가져다 쓰고 3초 후에 API를 다시 호출하는 식이다.
	- cacheTime: 얼만큼 오랫동안 캐시 메모리에 해당 캐시를 유지해놓을지 결정하는 값이다.


아래는 해당 코드를 적용한 화면이다. 홈 화면에서 빠져나와 다시 홈 화면을 켰을때, 처음에는 items 에 대한 GET 요청이 다시 발생하지 않았던 반면, staleTime 만큼 시간이 지나면 데이터가 stale 상태로 전환, API가 다시 호출되는 것을 확인할 수 있다.

![Screen Recording 2023-09-20 at 6 56 10 PM](https://user-images.githubusercontent.com/96381221/269247522-dae0d9e6-b349-4be4-b067-5125cd498e6d.gif)

# 결론
React Query를 적용하여 무한스크롤 코드를 개선해보았다. useInfiniteQuery 와 같은 훅도 매력적이었고, 특히 캐싱 기능이 정말 편리하고 강력하다고 느껴졌다. 라이브러리의 사용을 최소화하는 프로젝트일지라도 React Query의 사용은 적극적으로 고려해보게 될 것 같다.

# 참고
[https://github.dev/usmanabdurrehman/React-tutorials/blob/ReactQuerySuspense/src/App.tsx](https://github.dev/usmanabdurrehman/React-tutorials/blob/ReactQuerySuspense/src/App.tsx)