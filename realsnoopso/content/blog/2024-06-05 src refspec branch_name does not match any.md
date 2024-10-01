---
title: src refspec branch_name does not match any.md
date: 2024-06-05T00:00:32.169Z
---

# 문제

```
error: src refspec main does not match any
```

`git push --set-upstream origin main`을 시도하니 위와 같은 에러가 떴다. 분명 origin 에는 main 브랜치가 존재하는데 왜 그런걸까.

# 원인

origin에만 main 브랜치가 존재하고, 로컬에는 브랜치가 아무 것도 존재하지 않아 생겼던 것.

```
git branch

// 결과에 아무것도 노출되지 않음
```

# 해결

```
git switch -c main
```

위 명령어로 로컬에도 main 브랜치를 생성 해주니, 문제가 해결 되었다.
