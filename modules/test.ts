import { InstanceData } from "./core/InstanceManager";
import OAuthClient from "./core/OAuthClient";

(function() {
  const data: InstanceData = {
    "name": "test",
    "base": "https://dev263075.service-now.com/",
    "auth": {
      type: "oauth-token",
      clientID: "aaa",
      clientSecret: "bbb"
    }
  }

  const oauth: OAuthClient = new OAuthClient(data);
  console.log(oauth.getNewClientURL());
})();