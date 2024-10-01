---
title: not a git repository 에러
date: 2024-06-05T00:00:32.169Z
---

# 문제

로컬에서 폴더를 만들고, 해당 폴더에 remote 레포지토리를 설정하려고 하는데, 다음과 같은 에러가 반복되었다.

```
// git remote를 실행했을 경우

fatal: not a git repository (or any of the parent directories): .git
```

# 문제확인

```
// 1. 현재의 경로를 확인
pwd

// 2. .git 폴더가 이 디렉토리에 존재하는지 확인. 만약 존재하지 않다면, git 설정이 되지 않은 것
ls -la
```

# 해결

```
git init
```

위와 같이 git을 init 해주니 정상적으로 git 레포지토리로 설정이 완료되었다.
