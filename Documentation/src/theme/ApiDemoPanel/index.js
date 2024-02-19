import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Curl from "@theme/ApiDemoPanel/Curl";
import Response from "@theme/ApiDemoPanel/Response";
import sdk from "postman-collection";
import { Provider } from "react-redux";
import Accept from "./Accept";
import Authorization from "./Authorization";
import { createAuth } from "./Authorization/slice";
import Body from "./Body";
import Execute from "./Execute";
import MethodEndpoint from "./MethodEndpoint";
import ParamOptions from "./ParamOptions";
import { createPersistanceMiddleware } from "./persistanceMiddleware";
import Server from "./Server";
import { createServer } from "./Server/slice";
import { createStoreWithState } from "./store";
import styles from "./styles.module.css";
function ApiDemoPanel({ item }) {
  const { siteConfig } = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig;
  const options = themeConfig.api;
  const postman = new sdk.Request(item.postman);
  const acceptArray = Array.from(
    new Set(
      Object.values(item.responses ?? {})
        .map((response) => Object.keys(response.content ?? {}))
        .flat()
    )
  );
  const content = item.requestBody?.content ?? {};
  const contentTypeArray = Object.keys(content);
  const servers = item.servers ?? [];
  const params = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };
  item.parameters?.forEach((param) => {
    params[param.in].push(param);
  });
  const auth = createAuth({
    security: item.security,
    securitySchemes: item.securitySchemes,
    options,
  });
  const server = createServer({
    servers,
    options,
  });
  const persistanceMiddleware = createPersistanceMiddleware(options);
  const store2 = createStoreWithState(
    {
      accept: {
        value: acceptArray[0],
        options: acceptArray,
      },
      contentType: {
        value: contentTypeArray[0],
        options: contentTypeArray,
      },
      server: server,
      response: {
        value: undefined,
      },
      body: {
        type: "empty",
      },
      params,
      auth,
    },
    [persistanceMiddleware]
  );
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const { path, method } = item;
  return (
    <Provider store={store2}>
      <div
        style={{
          marginTop: "3.5em",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Authorization />

          {item.operationId !== undefined && (
            <div
              style={{
                marginBottom: "var(--ifm-table-cell-padding)",
              }}
            >
              <code>
                <b>{item.operationId}</b>
              </code>
            </div>
          )}

          <MethodEndpoint method={method} path={path} />

          <div className={styles.optionsPanel}>
            <ParamOptions />
            <Body
              jsonRequestBodyExample={item.jsonRequestBodyExample}
              requestBodyMetadata={item.requestBody}
            />
            <Accept />
          </div>

          <Server />

          <Curl postman={postman} codeSamples={item["x-code-samples"] ?? []} />

          <Execute postman={postman} proxy={options?.proxy} />
        </form>

        <Response />
      </div>
    </Provider>
  );
}
export default ApiDemoPanel;
