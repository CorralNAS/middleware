// Add User Template
// =================
// Handles the process of adding a new user. Provides an interface for setting up
// the configurable attributes of a new user.

"use strict";

var _      = require("lodash");
var React  = require("react");
var TWBS   = require("react-bootstrap");

var UsersMiddleware = require("../../../middleware/UsersMiddleware");

var GroupsStore      = require("../../../stores/GroupsStore");

var inputHelpers = require("../../../components/mixins/inputHelpers");
var userMixins   = require("../../../components/mixins/userMixins");
var viewerCommon = require("../../../components/mixins/viewerCommon");

var AddUser = React.createClass({

    mixins: [   inputHelpers
              , userMixins
              , viewerCommon ]

  , contextTypes: {
      router: React.PropTypes.func
  }

  , propTypes: {
        viewData: React.PropTypes.object.isRequired
    }

  , getInitialState: function() {
      var defaultValues = {
                              id    : this.getNextUID()
                            , shell : "/bin/csh"
                          };

      return {
        // FIXME: locallyModifiedValues is magical
          locallyModifiedValues : {}
        , defaultValues         : defaultValues
        , dataKeys              : this.props.viewData.format.dataKeys
      };
    }

  , handleValueChange: function( key, event ) {
      var value = this.refs[key].getValue();
      var newLocallyModifiedValues = this.state.locallyModifiedValues;

      var dataKey = _.find(this.state.dataKeys, function (dataKey) {
        return (dataKey.key === key);
      }, this);

      newLocallyModifiedValues[ key ] = this.processFormInput( event, value, dataKey );

      this.setState( { locallyModifiedValues: newLocallyModifiedValues } );
    }

    // Will return the next recommended UID (to be used as a default).
  , getNextUID: function() {

    }

  , submitNewUser: function() {
      var routing = this.props.viewData.routing;
      var newUserValues = {};
      var params        = {};

      // Stage edited values for submission. Don't include any read-only stuff that got in somehow.
      newUserValues = this.removeReadOnlyFields( this.state.locallyModifiedValues, this.state.dataKeys );

      // Convert the array of strings provided by the form to an array of integers.
      if( !_.isEmpty( newUserValues[ "groups" ] ) ){
        newUserValues[ "groups" ] = this.parseGroupsArray( newUserValues[ "groups" ] );
      }

      // Get ready to send the view to the new user.
      params[ routing[ "param" ] ] = newUserValues[ "username" ];

      // Submits the user and moves the view to the new user.
      // TODO: Only submit a user if all the required fields are there.
      // TODO: Make sure the new user was actually created before transitioning the route.
      UsersMiddleware.createUser( newUserValues, this.context.router.transitionTo( routing[ "route" ], params) );
  }

  , cancel: function () {

    }

  , render: function() {

      var addButtons =
        <TWBS.ButtonToolbar>
          <TWBS.Button className = "pull-right"
                       onClick   = { this.context.router.transitionTo("users") }
                       bsStyle   = "default">{"Cancel"}</TWBS.Button>
          <TWBS.Button className = "pull-right"
                       disabled  = { _.isEmpty( this.state.locallyModifiedValues ) }
                       onClick   = { this.submitNewUser}
                       bsStyle   = "info">{"Save New User"}</TWBS.Button>
        </TWBS.ButtonToolbar>;

      var inputFields =
        <form className = "form-horizontal">
          <TWBS.Grid fluid>
            {/*TODO: Style unedited default values differently from edited ones*/}
            <TWBS.Row>
              <TWBS.Col xs = {8}>
                {/* User id */}
                <TWBS.Input type             = "text"
                            ref              = "id"
                            label            = "User ID"
                            onChange         = { this.handleValueChange.bind( null, "id" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "id") && !_.isEmpty(this.state.locallyModifiedValues["id"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
                {/* username */}
                <TWBS.Input type             = "text"
                            ref              = "username"
                            label            = "User Name"
                            onChange         = { this.handleValueChange.bind( null, "username" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "username") && !_.isEmpty(this.state.locallyModifiedValues["username"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8"
                            required />
                {/* Full Name */}
                <TWBS.Input type             = "text"
                            ref              = "full_name"
                            label            = "Full Name"
                            onChange         = { this.handleValueChange.bind( null, "full_name" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "full_name") && !_.isEmpty(this.state.locallyModifiedValues["full_name"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
                {/* email */}
                <TWBS.Input type             = "text"
                            ref              = "email"
                            label            = "email"
                            onChange         = { this.handleValueChange.bind( null, "email" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "email") && !_.isEmpty(this.state.locallyModifiedValues["email"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
                {/* shell */}
                <TWBS.Input type             = "select"
                            label            = "Shell"
                            ref              = "shell"
                            defaultValue     = { this.state.defaultValues["shell"] }
                            onChange         = { this.handleValueChange.bind( null, "shell" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "shell") && !_.isEmpty(this.state.locallyModifiedValues["shell"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" >
                            { this.generateOptionsList( this.state.shells, "name" ) }
                </TWBS.Input>
                {/* primary group */}
                {/* TODO: Recommend the default group based on the username. Requires creating a group at user-creation time.*/}
                <TWBS.Input type             = "select"
                            label            = "Primary Group"
                            ref              = "group"
                            value            = { this.state.locallyModifiedValues["group"]? this.state.locallyModifiedValues["group"]: null }
                            onChange         = { this.handleValueChange.bind( null, "group" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "group") && !_.isEmpty(this.state.locallyModifiedValues["group"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8"
                            required >
                            { this.generateOptionsList( GroupsStore.getAllGroups(), "id", "name" ) }
                </TWBS.Input>
                {/* sshpubkey */}
                <TWBS.Input type             = "textarea"
                            ref              = "sshpubkey"
                            label            = "Public Key"
                            onChange         = { this.handleValueChange.bind( null, "sshpubkey" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "sshpubkey") && !_.isEmpty(this.state.locallyModifiedValues["sshpubkey"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8"
                            rows             = "10" />
                {/* Additional Groups */}
                <TWBS.Input type             = "select"
                            ref              = "groups"
                            label            = "Additional Groups"
                            onChange         = { this.handleValueChange.bind( null, "groups" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "groups") && !_.isEmpty(this.state.locallyModifiedValues["groups"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8"
                            required
                            multiple >
                            { this.generateOptionsList( GroupsStore.getAllGroups(), "id", "name" ) }
                </TWBS.Input>
              </TWBS.Col>
              <TWBS.Col xs = {4}>
                {/* locked */}
                <TWBS.Input type             = "checkbox"
                            label            = "Locked"
                            ref              = "locked"
                            defaultChecked   = { false }
                            onChange         = { this.handleValueChange.bind( null, "locked" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "locked") && !_.isEmpty(this.state.locallyModifiedValues["locked"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
                {/* sudo */}
                <TWBS.Input type             = "checkbox"
                            label            = "Sudo"
                            ref              = "sudo"
                            defaultChecked   = { false }
                            onChange         = { this.handleValueChange.bind( null, "sudo" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "sudo") && !_.isEmpty(this.state.locallyModifiedValues["sudo"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
                {/* password_disabled */}
                <TWBS.Input type             = "checkbox"
                            label            = "Password Disabled"
                            ref              = "password_disabled"
                            defaultChecked   = { false }
                            onChange         = { this.handleValueChange.bind( null, "password_disabled" ) }
                            groupClassName   = { _.has(this.state.locallyModifiedValues, "password_disabled") && !_.isEmpty(this.state.locallyModifiedValues["password_disabled"]) ? "editor-was-modified" : ""  }
                            labelClassName   = "col-xs-4"
                            wrapperClassName = "col-xs-8" />
              </TWBS.Col>
            </TWBS.Row>
          </TWBS.Grid>
        </form>;


      return (
        <div className="viewer-item-info">
          <TWBS.Grid fluid>
            { addButtons }
            { inputFields }
          </TWBS.Grid>
        </div>
      );
    }
});

module.exports = AddUser;
