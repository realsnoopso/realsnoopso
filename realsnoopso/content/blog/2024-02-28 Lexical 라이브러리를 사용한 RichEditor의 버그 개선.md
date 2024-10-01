---
title: Lexical 라이브러리를 사용한 RichEditor의 버그 개선
date: 2024-02-28T00:00:32.169Z
---

# 문제

editor 를 focus 하면 editor state가 없다는 에러가 뜬다.

```jsx
Error: setEditorState: the editor state is empty. Ensure the editor state's root node never becomes empty.

Source
components/RichTextEditor/index.tsx (53:13) @ setEditorState

  51 |   if (!hasFetched && pureBody) {
  52 |     const editorState = editor.parseEditorState(pureBody)
> 53 |     editor.setEditorState(editorState)
     |           ^
  54 |     setHasFetched(true)
  55 |   }
  56 | }, [editor, onContentChange, hasFetched])
```

# 현황

1. hasFetched가 false이며 pureBody가 존재하는 경우 위 에러가 실행된다.
2. form의 값이 변경된다
3. form.watch가 실행된다.
4. form value 안의 pureBody가 다음과 같이 변경된다.

```Jsx
pureBody {"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}
```

4. formData 안의 pureBody가 동일하게 변경된다

```jsx
export default function RichTextEditor({
  onContentChange,
  pureBody,
  className,
  readOnly,
}: {
  onContentChange?: ({
    body,
    pureBody,
  }: {
    body: string
    pureBody: string
  }) => void
  pureBody?: string
  className?: string
  readOnly?: boolean
}) {
  const [editor] = useLexicalComposerContext()
  const [hasFetched, setHasFetched] = React.useState(false)

  useEffect(() => {
    console.log('hasFetched', hasFetched)
    console.log('pureBody', pureBody, !!pureBody)
    if (!hasFetched && pureBody) {
      const editorState = editor.parseEditorState(pureBody)
      console.log('editorState', editorState)

      editor.setEditorState(editorState)

      setHasFetched(true)
    }
  }, [editor, onContentChange, hasFetched])

...
```

onContentChange를 삭제하니 해결이 되었다. 이럴 수가!

# 원인

```jsx
export default function RichTextEditor({
  onContentChange,
  pureBody,
  className,
  readOnly,
}: {
  onContentChange?: ({
    body,
    pureBody,
  }: {
    body: string
    pureBody: string
  }) => void
  pureBody?: string
  className?: string
  readOnly?: boolean
}) {
  const [editor] = useLexicalComposerContext()
  const [hasFetched, setHasFetched] = React.useState(false)

  useEffect(() => {
    console.log('hasFetched', hasFetched)
    console.log('pureBody', pureBody, !!pureBody)
    if (!hasFetched && pureBody) {
      const editorState = editor.parseEditorState(pureBody)
      console.log('editorState', editorState)

      editor.setEditorState(editorState)

      setHasFetched(true)
    }
  }, [editor, onContentChange, hasFetched])

  const sendEditorStateToParent = useCallback(() => {
    const rootNode = $getRoot()
    const editorStateString = JSON.stringify(editor.getEditorState().toJSON())
    const text = rootNode.getTextContent()
    onContentChange &&
      onContentChange({ body: text, pureBody: editorStateString })
  }, [editor, onContentChange])

  useEffect(() => {
    const unsubscribe = editor.registerUpdateListener(() => {
      editor.update(() => {
        sendEditorStateToParent()
      })
    })

    return () => {
      unsubscribe()
    }
  }, [editor])
...

```

1. 사용자가 editor 를 포커스 하는 순간 editor.update이 실행됨
2. 그 순간 sendEditorStateToParent 가 실행되며 비어있는 상태의 editorState를 setEditorState하려고 시도
3. RootNode에 아무것도 존재하지 않으므로 에러를 뱉음

위 디버깅에 더 확신을 얻기 위해 LexicalComposer에 전달되는 초기 값을 다음과 같이 추가해 보았다. 그랬더니 동일한 코드 상황에서 에러가 발생하지 않았다.

```jsx
import { $createTextNode, $getRoot } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
export default function prepopulatedText() {
  const root = $getRoot();
  // 아래는 추가된 내용
  const heading = $createHeadingNode("p");
  heading.append($createTextNode("text"));
  root.append(heading);
}
```

# 해결

해당 버그가 발생한 코드 부분은 전부 불필요하기도 해서 해당 코드를 전부 삭제하는 것으로 해결했다.
