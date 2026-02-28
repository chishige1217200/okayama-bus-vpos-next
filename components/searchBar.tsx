import {
  ActionBar,
  Button,
  Center,
  Clipboard,
  CloseButton,
  Dialog,
  Portal,
  QrCode,
  Text,
} from "@chakra-ui/react";
import {
  LuCircleArrowLeft,
  LuImages,
  LuNotebookPen,
  LuShare2,
} from "react-icons/lu";

const SearchBar = () => {
  return (
    <ActionBar.Root open={true}>
      <ActionBar.Positioner>
        <ActionBar.Content>
          <Dialog.Root placement="center">
            <Dialog.Trigger asChild>
              <Button variant="outline" size="sm">
                <LuCircleArrowLeft />
                ブック一覧
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>確認</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Dialog.Description>
                      操作中の画面から離れます。よろしいですか？
                    </Dialog.Description>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <CloseButton variant="outline">いいえ</CloseButton>
                    </Dialog.ActionTrigger>
                    <Button colorPalette="red">はい</Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
          <Dialog.Root placement="center">
            <Dialog.Trigger asChild>
              <Button variant="outline" size="sm">
                <LuShare2 />
                共有
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>リンク</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <div className="flex items-center gap-2">
                      <Text></Text>
                      <Clipboard.Root value={""}>
                        <Clipboard.Trigger asChild>
                          <Button variant="surface" size="sm">
                            <Clipboard.Indicator />
                          </Button>
                        </Clipboard.Trigger>
                      </Clipboard.Root>
                    </div>
                    <Center>
                      <QrCode.Root value={""} size="2xl">
                        <QrCode.Frame>
                          <QrCode.Pattern />
                        </QrCode.Frame>
                      </QrCode.Root>
                    </Center>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <CloseButton variant="outline">閉じる</CloseButton>
                    </Dialog.ActionTrigger>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
          <ActionBar.Separator />
          <Button variant="outline" size="sm">
            <LuImages />
            フォト管理
          </Button>
          <Button variant="outline" size="sm">
            <LuNotebookPen />
            ブック設定
          </Button>
        </ActionBar.Content>
      </ActionBar.Positioner>
    </ActionBar.Root>
  );
};

export default SearchBar;
