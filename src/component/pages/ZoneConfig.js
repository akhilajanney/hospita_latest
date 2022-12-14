import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";
import { floorMap, zoneConfiguration } from "../../urls/apis";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class ZoneConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    axios({
      method: "GET",
      url: floorMap,
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            for (let i = 0; i < this.fdata.length; i++) {
              $("#fname").append(
                "<option value=" +
                this.fdata[i].id +
                ">" +
                this.fdata[i].name +
                "</option>"
              );
              $("#fname1").append(
                "<option value=" +
                this.fdata[i].id +
                ">" +
                this.fdata[i].name +
                "</option>"
              );
            }
          } else {
            $("#master-error").text(
              "Please Upload Floormap to Register Master Gateway."
            );
          }
        } else {
          $("#master-error").text("Unable To Fetch Floor Names");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#config_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#master-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Displays Delete tag form on clicking Delete Tag Button */
  show = () => {
    $("input[type=text]").val("");
    $("input[type=number]").val("");
    document.getElementById("del_form").style.display =
      $("#del_form").css("display") === "none" ? "block" : "none";
    window.scrollTo(0, document.body.scrollHeight);
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    $("#conf-error").text("");
    $("#conf-success").text("");
  };

  /** Create zones for particular floor */
  register = (e) => {
    e.preventDefault();
    this.hide();
    let floor = $("#fname").val();
    let zonename = $("#zonename").val();
    let x1 = $("#x").val();
    let y1 = $("#y").val();
    let x2 = $("#x1").val();
    let y2 = $("#y1").val();
    if (
      zonename.length !== 0 &&
      x1.length !== 0 &&
      y1.length !== 0 &&
      x2.length !== 0 &&
      y2.length !== 0
    ) {
      let data = {
        id: floor,
        zonename: zonename,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
      };
      console.log(data);
      axios({ method: "POST", url: zoneConfiguration, data: data })
        .then((response) => {
          // console.log(response);
          if (response.status === 201) {
            $("#zonename").val("");
            $("#x").val("");
            $("#y").val("");
            $("#x1").val("");
            $("#y1").val("");
            $("#conf-success").text("Zone Is Registered Successfully.");
          } else {
            $("#conf-error").text("Unable To Register Zone.");
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again."
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else {
      $("#conf-error").text("Please Enter All Fields.");
    }
  };

  /** Delete zones on particular floor */
  unregister = (e) => {
    e.preventDefault();
    this.hide();
    let floorid = $("#fname1").val();
    let name = $("#zonename1").val();
    if (floorid.length !== 0 && name.length !== 0) {
      axios({
        method: "DELETE",
        url: zoneConfiguration + "?floorid=" + $("#fname1").val(),
        data: { floorid: floorid, zonename: name },
      })
        .then((response) => {
          // console.log(response);
          if (response.status === 200) {
            $("#conf-success").text("Zone is Deleted Successfully.");
            $("#del_form").css("display", "none");
          } else {
            $("#conf-error").text("Unable To Delete Zone.");
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again."
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else {
      $("#conf-error").text("Please Enter Zonename");
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#config_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  render() {
    return (
      <Fragment>
        <div className="panel">
          <span className="main-heading">Zone Configuration</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}></div>
          <div>
            {/* Element for displaying error messages */}
            <span className="error-msg" id="conf-error" style={{ fontWeight: 600 }}></span>
            <span className="success-msg" id="conf-success" style={{ fontWeight: 600 }}></span>
          </div>
          <form>
            <div className="input-group">
              <span className="label">Floor Name : </span>
              <select name="type" id="fname"></select>
            </div>
            <div className="input-group">
              <span className="label">Zone Name : </span>
              <input type="text" id="zonename" required="required" />
            </div>
            <div className="input-group">
              <span className="label">X Co-ordinate : </span>
              <input type="number" id="x" required="required" />
            </div>
            <div className="input-group">
              <span className="label">Y Co-ordinate : </span>
              <input type="number" id="y" required="required" />
            </div>
            <div className="input-group">
              <span className="label">X1 Co-ordinate : </span>
              <input type="number" id="x1" required="required" />
            </div>
            <div className="input-group">
              <span className="label">Y1 Co-ordinate : </span>
              <input type="number" id="y1" required="required" />
            </div>

            <div className="input-group" style={{ marginTop: '20px' }}>

              <button style={{ marginLeft: '80px', background: '#eb6565' }}
                onClick={() => {
                  this.show();
                  this.hide();
                }}
                className="btn success-btn">
                Delete Zone
              </button>
              
              <input style={{ marginLeft: '20px' }}
                type="submit"
                value="Add  Zone"
                onClick={this.register}
                className="btn success-btn"
              />
            </div>
          </form>
          {/* Button for toggeling for Deleting zone Form */}

          <form id="del_form" style={{ display: "none" }} className="fading">
            <div className="input-group">
              <span className="label">Floor Name : </span>
              <select name="type" id="fname1"></select>
            </div>
            <div className="input-group">
              <span className="label">Zone Name : </span>
              <input type="text" id="zonename1" required="required" />
            </div>
            <div className="input-group">
              <input style={{ background: '#eb6565' }}
                type="submit"
                value="Delete Zone"
                onClick={this.unregister}
                className="btn success-btn"
              />
            </div>
          </form>
        </div>

        {/* Display modal to display error messages */}
        <div id="config_displayModal" className="modal">
          <div className="modal-content">
            <p id="content" style={{ textAlign: "center" }}></p>
            <button
              id="ok"
              className="btn-center btn success-btn"
              onClick={this.sessionTimeout}
            >
              OK
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default ZoneConfig;
