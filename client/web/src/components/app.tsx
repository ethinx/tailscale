import cx from "classnames"
import React from "react"
import LegacyClientView from "src/components/views/legacy-client-view"
import LoginClientView from "src/components/views/login-client-view"
import ReadonlyClientView from "src/components/views/readonly-client-view"
import useAuth, { AuthResponse, SessionsCallbacks } from "src/hooks/auth"
import useNodeData from "src/hooks/node-data"
import ManagementClientView from "./views/management-client-view"

export default function App() {
  const { data: auth, loading: loadingAuth, sessions } = useAuth()

  return (
    <div className="flex flex-col items-center min-w-sm max-w-lg mx-auto py-14">
      {loadingAuth ? (
        <div className="text-center py-14">Loading...</div> // TODO(sonia): add a loading view
      ) : (
        <WebClient auth={auth} sessions={sessions} />
      )}
    </div>
  )
}

function WebClient({
  auth,
  sessions,
}: {
  auth?: AuthResponse
  sessions: SessionsCallbacks
}) {
  const { data, refreshData, updateNode } = useNodeData()

  return (
    <>
      {!data ? (
        <div className="text-center py-14">Loading...</div> // TODO(sonia): add a loading view
      ) : data?.Status === "NeedsLogin" || data?.Status === "NoState" ? (
        // Client not on a tailnet, render login.
        <LoginClientView
          data={data}
          onLoginClick={() => updateNode({ Reauthenticate: true })}
        />
      ) : data.DebugMode === "full" && auth?.ok ? (
        // Render new client interface in management mode.
        <ManagementClientView {...data} />
      ) : data.DebugMode === "login" || data.DebugMode === "full" ? (
        // Render new client interface in readonly mode.
        <ReadonlyClientView data={data} auth={auth} sessions={sessions} />
      ) : (
        // Render legacy client interface.
        <LegacyClientView
          data={data}
          refreshData={refreshData}
          updateNode={updateNode}
        />
      )}
      {data && <Footer licensesURL={data.LicensesURL} />}
    </>
  )
}

export function Footer(props: { licensesURL: string; className?: string }) {
  return (
    <footer
      className={cx("container max-w-lg mx-auto text-center", props.className)}
    >
      <a
        className="text-xs text-gray-500 hover:text-gray-600"
        href={props.licensesURL}
      >
        Open Source Licenses
      </a>
    </footer>
  )
}
