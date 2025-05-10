import * as React from "react";
import { DefaultButton, TextField, Modal } from "@fluentui/react";
import Center from "./Center";

interface LoginProps {
  onSave: (token: string) => void;
}

export default function Login({ onSave }: LoginProps) {
  const [token, setToken] = React.useState<string>("");
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const handleHelpClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
        <div style={{ marginRight: "5px" }}>
          <h3>Авторизация</h3>
        </div>
        <img src="https://i.imgur.com/9PrBQy3.png" alt="icon-16" />
      </div>
      <TextField
        style={{
          width: "100%",
          display: "flex",
        }}
        value={token}
        onChange={(_, newValue) => setToken(newValue || "")}
        placeholder={"Введите Client Secret key сюда"}
      />
      <Center
        style={{
          marginTop: "10px",
        }}
      >
        <DefaultButton
          onClick={() => onSave(token)}
          styles={{ root: { borderRadius: "20px", backgroundColor: "#0088cc", color: "white" } }}
        >
          Сохранить Client key
        </DefaultButton>
        <DefaultButton
          onClick={handleHelpClick}
          styles={{ root: { borderRadius: "20px", backgroundColor: "#0088cc", color: "white", marginLeft: "10px" } }}
        >
          Помощь
        </DefaultButton>
        <DefaultButton
          href="https://developers.sber.ru/studio/workspaces/my-space/get/gigachat-api"
          target="_blank"
          styles={{ root: { borderRadius: "20px", backgroundColor: "#0088cc", color: "white", marginLeft: "10px" } }}
        >
          Получить токен
        </DefaultButton>
      </Center>
      {/* Modal to display plugin information */}
      <Modal isOpen={showModal} onDismiss={handleCloseModal} isBlocking={false}>
        <div style={{ padding: "20px" }}>
          <h3>GigaChat</h3>
          <p>Для дальнейшей работы необходимо получить токен для авторизации.</p>
          <ol style={{}}>
            <li>Нажмите на кнопку - Получить токен.</li>
            <li>Авторизуйтесь на сайте Сбера.</li>
            <li>Создайте проект.</li>
            <li>Сгенерируйте Client Secret и скопируйте его из поля Авторизационные данные.</li>
            <li>Вставьте Client Secret key в поле и сохраните его.</li>
          </ol>
          <p>
            На данном этапе интегрирован чат-бот, вы можете отправлять ему запросы и получать ответы. Сгенерированные
            ответы с помощью кнопки - Вставить можно сразу вставить в Word, а так же скопировать в память с кнопки -
            Скопировать. Работает меню быстрого доступа для работы с текстом.
          </p>
          <DefaultButton
            onClick={handleCloseModal}
            styles={{
              root: {
                borderRadius: "20px",
                backgroundColor: "#0088cc",
                color: "white",
                marginLeft: "10px",
              },
            }}
          >
            Закрыть
          </DefaultButton>
        </div>
      </Modal>
    </>
  );
}
