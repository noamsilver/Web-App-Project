import React from "react"
import { createStore, applyMiddleware } from "redux"
import { storyReduxLogger } from "./withRedux"
import { composeWithDevTools } from "redux-devtools-extension"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router"
import rootReducer from "Reducers"
import Root from "containers/Root"
import createSagaMiddleware from "redux-saga"
import RootSaga from "sagas"
import { routerMiddleware, ConnectedRouter } from "react-router-redux"
import { createBrowserHistory, createMemoryHistory } from "history"

// const history = createBrowserHistory()

export function createStoreAndStory({
  path,
  component,
  sagaFunction,
  connectToProductionSaga,
}) {
  var ROUTER_MIDDLEWARE
  var middlewares = [storyReduxLogger]

  if (path) {
    var history = createMemoryHistory({
      initialEntries: [path],
      initialIndex: 0,
    })
    ROUTER_MIDDLEWARE = routerMiddleware(history)
    middlewares.push(ROUTER_MIDDLEWARE)
  }

  if (sagaFunction || connectToProductionSaga) {
    var sagaMiddleware = createSagaMiddleware()
    // middlewares.unshift(sagaMiddleware)
    middlewares.push(sagaMiddleware)
  }
  /**
   * Redux Store
   * @type {{dispatch:()=>void}}
   */
  const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(...middlewares)),
  )
  if (connectToProductionSaga) {
    sagaMiddleware.run(RootSaga)
  }
  if (sagaFunction) {
    sagaMiddleware.run(sagaFunction)
  }
  const UpperCaseComponent = component
  return {
    store,
    sagaMiddleware,
    story: (
      <Provider store={store}>
        <div>
          {path && (
            <ConnectedRouter history={history}>
              <Root />
            </ConnectedRouter>
          )}
          {component && <UpperCaseComponent />}
        </div>
      </Provider>
    ),
  }
}
