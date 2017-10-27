import React from 'react';
import Login from './Login';
import Banner from './Banner';
import  createHistory  from 'history/createBrowserHistory';

const history = createHistory();

export default () => {
  return (
    <div className="wrapper">
      <div className="item__text">
        <Banner title="Page not found"
          image="/images/notfound.svg"/>
        <button className="button" onClick={() => history.go(-1)}>
          Click here to go back
        </button>
      </div>
    </div>
  );
};
