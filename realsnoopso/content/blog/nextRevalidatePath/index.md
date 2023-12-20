---
title: Next.js에서 GET 요청의 캐시 삭제하기
date: 2023-12-20T00:00:32.169Z
description: Server Action을 이용해 캐시를 삭제 해보자
---
# 문제
나는 사용자의 프로필을 수정하는 기능을 개발하고 있었는데, Post 요청이 일어난 후 프로필 페이지로 이동했을 때 수정 내용이 반영되지 않는 것을 발견했다. 

<img src="https://gist.github.com/assets/96381221/1da6f867-f3f7-48af-ab5e-75445714b29f">

위에서 볼 수 있듯이 새로고침을 실행하면 정상적으로 업데이트된 내용이 반영되는 것을 확인할 수 있다. 따라서 요청은 정상적으로 일어났고, 캐시가 삭제 되지 않아 발생한 문제로 추측 되었다.


# 현재 상황

<img src="https://gist.github.com/assets/96381221/7e750e65-68c0-4803-88f5-a9222e37c657">

나는 Next.js 13 버전, 그 중에서도 app 디렉토리를 사용하고 있다. 위 이미지는 현재의 페이지 구조이다. `[slug]` 경로에 있는 서버 컴포넌트에서 Get 요청이 일어나고 있고, `/my/profile` 경로에 있는 클라이언트 컴포넌트에서 에서 POST 요청이 일어나고 있다. POST 요청 이후에는 `/@${slug}` 페이지로 리다이렉션 된다.

```jsx
// app/(default)/[slug]/page.tsx

import { Metadata } from 'next'
import { usersApis } from '@/apis/users'
import UserPage from './components/users/UserPage'
import BuildingPage from './components/buildings/BuildingPage'
import { buildingsApis } from '@/apis/buildings'

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> => {
  ...

  const username = decodeURIComponent(params.slug).replace('@', '')
  const user = await usersApis.getUser({ username }) // 여기에서 GET 요청

  return {
    ...
  }
}
...

export default async function ProfilePage({
  params,
}: {
  params: { slug: string }
}) {
  ...
  return <UserPage params={params} />
}
```

```jsx
// app/(default)/my/profile/page.tsx
'use client'

import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useUserProfileContext } from '@/context/user-profile-context'
...

export default function MyProfilePage() {
  ...
  const { user, setUser } = useUserProfileContext()

  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserDto) => {
      return usersApis.editUser({
        body,
      })
    },
    onSuccess: async (user) => {
      if (user) {
        setUser(user)
        toast({
          variant: 'default',
          description: 'Profile updated successfully',
        })
        router.push(`/@${user.username}`) // 여기에서 리다이렉션
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
        description: error instanceof Error && error.message,
      })
    },
  })

  ...

  function onSubmit(data: UpdateUserFormValues) {
    if (isUsernameAvailable === false) return
    updateMutation.mutate({ ...data } as UpdateUserDto)
  }

  ...

  return (
    ...
  )
}

```

# 원인

Next.js 서버 컴포넌트 내부에서 fetch를 실행할 경우 내부적으로 캐시가 자동으로 일어난다. 따라서 기존 방문 이력이 없고 param 혹은 query가 변경되지 않은 경우에는 해당 페이지의 Get 요청을 재실행하지 않는다. 

# 해결책

## 그럼 query를 변경해 볼까?

그럼 query를 변경하면 되는거 아닌가? 해서 변경을 해보았다. 

```jsx
// app/(default)/my/profile/page.tsx
'use client'
...
router.push(
  `/@${user.username}?${qs.stringify({
    updatedAt: new Date().toISOString(),
  })}`,
)
...
```

자 그럼 결과는.. POST 요청을 실행하자 마자 데이터가 잘 업데이트가 되었다. 캐시 문제가 맞다는 것이 확실히 확인이 되었다. 하지만 깔끔한 해결책이 아님은 분명해 보인다. 사용자에게 노출되는 주소에서 불필요한 정보가 보이게 되니까 말이다.

<img src="https://gist.github.com/assets/96381221/6c16b659-c059-4d3a-985e-b4e05b0fb00c" alt="updatedAt 이 주소에 노출된다">
## RevalidatePath?
나는 Next.js learn을 읽어보며 revalidatePath 를 이용하여 원하는 시점에 해당 주소의 캐시를 삭제할 수 있다는 사실을 알게 되었다. RevalidatePath 사용법은 다음과 같다.

```jsx
import { revalidatePath } from 'next/cache'

revalidatePath('/blog/post-1')
```

여기에서 문제는, revalidatePath는 서버에서만 실행 가능하다는 것이다. 하지만 현재 내가 POST 요청을 실행하는 곳은 클라이언트이기 때문에 프로필 페이지로 이동하기 전 서버를 한번 거쳐갈 필요가 있었다.

## 서버에서 RevalidatePath 실행하기
이 부분에서 막혀있다가, 멘토이신 서진님과 함께 디버깅을 시작했다. 그러다가 `next.js server fetch cache purge` 라는 키워드로 검색을 했고, 검색 결과 바로 아래 Next.js 공식 문서로 연결되었다. (`purge`라는 단어가 생소했는데, 캐시를 삭제한다는 표현을 영어로 `purge cached data`로 표현한다는 것을 알게 되었다)

https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#convention

위 문서에서 Server Action 혹은 Route Handler 안에서 revalidatePath 혹은 revalidateTag 메소드를 사용함으로써 원하는 시점에 캐시를 삭제할 수 있다는 것을 확인할 수 있었다.

그럼 Server Action과 Route Handler두가지 선택지 중 어떤 것을 선택하는 것이 좋을까? Server Action은 비동기 함수를 실행하는 것이고, Route Handler는 따로 네트워크 요청이 발생하기 때문에 성능상 Server Action을 사용하는 편이 더 좋을 것이라 판단했다. 

그럼 Server Action에서 RevalidatePath를 사용해 보자. 우선 Next.js 13 버전을 사용하고 있으므로, Server Action 을 사용하기 위해 설정 값을 추가해준다.

```js
// next.config.js

module.exports = {
  ...
  experimental: {
    serverActions: true, // 추가
  },
}
```

그 후, revalidatePath를 실행하는 Server Action 함수를 다음과 같이 작성해 주었다. 이 페이지 외에도 여러페이지에서 공통적으로 발생할 수 있는 상황이기에 범용적으로 사용할 수 있도록 작성했다.

```tsx
// app/(default)/action.ts

'use server'

import { revalidatePath } from 'next/cache'

export async function revalidateCache(path: string) {
  await revalidatePath(path)
}
```

```jsx
// app/(default)/my/profile/page.tsx
'use client'
import { revalidateCache } from '@/app/actions'
...

await revalidateCache(`/@${user.username}`)
router.push(`/@${user.username}`)
...
```

위와 같이 작성하니, GET 요청에서 캐시된 데이터 대신 새로운 데이터가 정상적으로 반환되는 것을 확인할 수 있었다. 

# 참고
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#convention
- https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#enabling-server-actions-v13
