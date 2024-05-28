import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  AwaitedReactNode,
  Key,
} from "react";

const ErrorMessage = ({ messages }) => {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
      <ul>
        {messages.map(
          (
            message:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<any, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<AwaitedReactNode>
              | null
              | undefined,
            index: Key | null | undefined
          ) => (
            <li key={index}>{message}</li>
          )
        )}
      </ul>
    </div>
  );
};

export default ErrorMessage;
