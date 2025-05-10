import React, { useState, useEffect } from "react";
import { DefaultButton, MessageBar, MessageBarType, ProgressIndicator, TextField } from "@fluentui/react";
import Center from "./Center";
import Container from "./Container";
import Login from "./Login";
import axios from "axios";

export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>("");

  const $api = axios.create({
    baseURL: "http://localhost:5000",
  });

  const mainApi = {
    getText({ prompt }: { prompt: string }) {
      return $api.post<any>("prompt", {
        prompt,
      });
    },
    getToken({ apiKey }: { apiKey: string }) {
      return $api.post<any>("api", {
        apiKey,
      });
    },
  };

  useEffect(() => {
    const key = localStorage.getItem("apiKey");
    if (key) {
      setApiKey(key);
    }
  }, []);

  const saveApiKey = (key: string) => {
    const existingKey = localStorage.getItem("apiKey");
    console.log(existingKey);
    setApiKey(key);
    localStorage.setItem("apiKey", key);
    if (!existingKey || existingKey !== key) {
      mainApi
        .getToken({ apiKey: key })
        .then(() => {
          setError("");
        })
        .catch((e) => {
          console.error(e);
          setApiKey("");
          localStorage.removeItem("apiKey");
          setError("Не удалось получить токен из API, попробуйте снова");
        });
    } else {
      setError("");
      mainApi.getToken({ apiKey: key });
    }
  };

  const onClick = async () => {
    setGeneratedText("");
    setLoading(true);
    try {
      const response = await mainApi.getText({ prompt });
      setGeneratedText(response.data.prompt);
    } catch (e) {
      console.error(e);
      setError("Ошибка при получении текста");
      setApiKey("");
    } finally {
      setLoading(false);
    }
  };

  const onInsert = async () => {
    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
      const error = asyncResult.error;
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.log(error.message);
      } else {
        Office.context.document.setSelectedDataAsync(
          generatedText,
          { coercionType: Office.CoercionType.Text },
          function (asyncResult) {
            const error = asyncResult.error;
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
              console.log(error.message);
            }
          }
        );
      }
    });
  };

  const copyToClipboard = async (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);

    el.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        console.log("Текст скопирован в буфер обмена");
      } else {
        console.error("Не удалось скопировать текст");
      }
    } catch (err) {
      console.error("Ошибка при копировании текста: ", err);
    } finally {
      document.body.removeChild(el);
    }
  };

  const onCopy = () => {
    copyToClipboard(generatedText);
  };

  return (
    <Container>
      {apiKey ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
            <div style={{ marginRight: "10px" }}>
              <h3>GigaChat</h3>
            </div>
            <img src="https://i.imgur.com/9PrBQy3.png" alt="icon-16" />
          </div>
          <TextField
            placeholder="Спросите меня о чём-нибудь"
            value={prompt}
            rows={5}
            multiline={true}
            onChange={(_, newValue) => setPrompt(newValue || "")}
          />
          <Center
            style={{
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            <DefaultButton
              onClick={onClick}
              styles={{ root: { borderRadius: "20px", backgroundColor: "#0088cc", color: "white" } }}
            >
              Сгенерировать
            </DefaultButton>
          </Center>
          {loading && <ProgressIndicator label="Генерирую ответ..." />}
          {generatedText && (
            <div>
              <p
                style={{
                  textAlign: "justify",
                }}
              >
                {generatedText}
              </p>
              <Center>
                <DefaultButton
                  iconProps={{ iconName: "Add" }}
                  onClick={onInsert}
                  styles={{ root: { borderRadius: "20px" } }}
                >
                  Вставить
                </DefaultButton>
                <DefaultButton
                  iconProps={{ iconName: "Copy" }}
                  onClick={onCopy}
                  styles={{ root: { borderRadius: "20px" } }}
                >
                  Копировать
                </DefaultButton>
              </Center>
            </div>
          )}
        </>
      ) : (
        <Login onSave={saveApiKey} />
      )}
      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
    </Container>
  );
}
