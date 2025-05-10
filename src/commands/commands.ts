/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
import axios from "axios";

const $api = axios.create({
  baseURL: "http://localhost:5000",
});

const mainApi = {
  async postData(endpoint: string, prompt: string) {
    return $api.post(`menu/${endpoint}`, { prompt });
  },
  getToken({ apiKey }: { apiKey: string }) {
    return $api.post("api", {
      apiKey,
    });
  },
};

let key: string | null;

if (typeof window !== "undefined") {
  key = localStorage.getItem("apiKey");
  if (key) {
    console.log("API Key:", key);
  } else {
    console.log("API Key not found.");
  }
}

Office.onReady(() => {
  // If needed, Office.js is ready to be called.
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event
 * @param endpointModifier
 */
async function handleAction(event: Office.AddinCommands.Event, endpointModifier: string) {
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, async function (asyncResult) {
    const error = asyncResult.error;
    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
      console.log(error.message);
    } else {
      const prompt: string = asyncResult.value as string;
      try {
        const response = await mainApi.postData(endpointModifier, prompt);
        switch (endpointModifier) {
          case "finish":
            Office.context.document.setSelectedDataAsync(prompt + " " + response.data.prompt, {
              coercionType: Office.CoercionType.Text,
            });
            break;
          case "mainthemes":
            Office.context.document.setSelectedDataAsync(prompt + "\nГлавные темы: \n" + response.data.prompt, {
              coercionType: Office.CoercionType.Text,
            });
            break;
          case "tooptions":
            Office.context.document.setSelectedDataAsync("Оглавление: \n" + response.data.prompt + "\n\n" + prompt, {
              coercionType: Office.CoercionType.Text,
            });
            break;
          case "explanation":
            Office.context.document.setSelectedDataAsync(prompt + " (" + response.data.prompt + ") ", {
              coercionType: Office.CoercionType.Text,
            });
            break;
          case "easy":
          case "fix":
            Office.context.document.setSelectedDataAsync(response.data.prompt, {
              coercionType: Office.CoercionType.Text,
            });
            break;
          default:
            console.log("Unknown endpoint modifier:", endpointModifier);
        }
      } catch (apiError) {
        console.error("Error during API call:", apiError);
      }
    }
    event.completed();
  });
}

async function MakeTextEasy(event: Office.AddinCommands.Event) {
  handleAction(event, "easy");
}

async function FinishText(event: Office.AddinCommands.Event) {
  handleAction(event, "finish");
}

async function FixText(event: Office.AddinCommands.Event) {
  handleAction(event, "fix");
}

async function MainThemesText(event: Office.AddinCommands.Event) {
  handleAction(event, "mainthemes");
}

async function ExplanationText(event: Office.AddinCommands.Event) {
  handleAction(event, "explanation");
}

async function toOptionsText(event: Office.AddinCommands.Event) {
  handleAction(event, "tooptions");
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

const g = getGlobal() as any;

// The add-in command functions need to be available in global scope
g.MakeTextEasy = MakeTextEasy;
g.FinishText = FinishText;
g.FixText = FixText;
g.MainThemesText = MainThemesText;
g.ExplanationText = ExplanationText;
g.toOptionsText = toOptionsText;

// Register the function with Office.
Office.actions.associate("MakeTextEasy", MakeTextEasy);
Office.actions.associate("FinishText", FinishText);
Office.actions.associate("FixText", FixText);
Office.actions.associate("MainThemesText", MainThemesText);
Office.actions.associate("ExplanationText", ExplanationText);
Office.actions.associate("toOptionsText", toOptionsText);
