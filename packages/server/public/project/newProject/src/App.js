import './App.css';
import { NavTab, RoutedTabs } from 'react-router-tabs';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div>
          <RoutedTabs startPathWith={''}>
            <NavTab to="/admins">Admins</NavTab>
            <NavTab to="/moderators">Moderators</NavTab>
            <NavTab to="/users">Users</NavTab>
          </RoutedTabs>

          <Switch>
            <Route exact path={`/`} render={() => <Redirect replace to={`/admins`} />} />
            <Route path={`/admins`} component={Admins} />
            <Route path={`/moderators`} component={Moderators} />
            <Route path={`/users`} component={Users} />
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}
export const Admins = () => (
  <div>
    <ul>
      <li>Buddy</li>
      <li>Jerrie</li>
      <li>Luna</li>
      <li>Suanne</li>
    </ul>
  </div>
);

export const Moderators = () => (
  <div>
    <ul>
      <li>Prince</li>
      <li>Art</li>
      <li>Shae</li>
      <li>Marget</li>
    </ul>
  </div>
);

export const Users = ({ match: { path } }) => (
  <div>
    <RoutedTabs startPathWith={`${path}`}>
      <NavTab to="/admins1">Admins</NavTab>
      <NavTab to="/moderators1">Moderators</NavTab>
    </RoutedTabs>

    <Switch>
      <Route exact path={`/users`} render={() => <Redirect to={`${path}/admins1`} />} />
      <Route path={`${path}/admins1`} component={Admins} />
      <ProtectedRoute path={`${path}/moderators1`} redirectTo={`${path}/admins1`} component={Moderators} />
    </Switch>
  </div>
)

const ProtectedRoute = (props) => {
  return (<Redirect replace to={props.redirectTo} />)
}
export default App;