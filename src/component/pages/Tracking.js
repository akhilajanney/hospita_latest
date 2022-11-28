/* eslint-disable no-useless-concat */
import React, { Component, Fragment } from "react";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import "./Pulse.css";
import 'animate.css';
import {
  zoneConfiguration,
  empDailyData,
  empWeeklyData,
  empMonthlyData
} from "../../urls/apis";
import ApexCharts from 'react-apexcharts';
import { DataLoading, floorMap, chartOption } from './common';

const graphBtn = {
  padding: "8px 10px",
  border: "none",
  marginLeft: "15px",
  borderRadius: "4px",
  fontSize: "16px",
  cursor: "pointer",
  color: "Black",
  fontWeight: "bold",
  boxShadow: "3px 3px 5px 3px rgba(0, 0, 0, 0.25)",
};

axios.defaults.xsrfHeaderName = "x-csrftoken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

class Tracking extends Component {
  fWidth = 0;
  fHeight = 0;
  floorData = [];
  constructor() {
    super();
    this.state = {
      error: false,
      message: '',
      zoneName: "",
      loading: false,
      series: [],
      chartOpts: {},
      chartColor: [],
    }
  }

  chart_Option = async (graphColor) => {
    this.setState({ chartColor: graphColor });
    let value = await chartOption(graphColor, "yyyy-MM-dd HH:mm");
    this.setState({ chartOpts: value });
  }


  componentDidMount = async () => {
    linkClicked(1);
    this.chart_Option(["#352cf2"]);
    this.floor = await floorMap();
    if (this.floor.floorData.length !== 0) {
      this.floorData = this.floor.floorData;
      $("#floorBlock").css("display", "block");
      this.plotFloorMap();
    } else if (this.floor.message === "sessionout") {
      $("#displayModal").css("display", "block");
      $("#content").text("User Session has timed out. Please Login again");
    } else {
      this.setState({
        loading: false,
        error: this.floor.error,
        message: this.floor.message
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }

  plotFloorMap = () => {
    $("#track-error").text("");
    let floorID = $("#fname").val();
    this.fimage = this.floorData[floorID];
    this.fWidth = this.fimage.width;
    this.fHeight = this.fimage.height;
    let imgheight = ($(window).height() - 157)
    $("#tempimg").attr({ "src": this.fimage.image, "alt": "temp" });
    // $("#tempimg").attr("style", "width:auto;height:" + imgheight + "px");
    $("#tempimg").attr("style", "width:auto;height:auto");

    $("#lastupdated").css("display", "none");
    $("#temp").children("div").remove();
    $("#tempChart").remove();
    $("#temp .sensors").remove();
    $("#graph_opt").css("display", "none");
    $("input[type=text]").val("");
    this.timeout = setTimeout(async () => {
      $("#temp .sensors").remove();
      $("#temp #empls").remove();
      await this.getZones();
      this.plotAssets();
    }, 1 * 1000);
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.plotAssets();
    }, 5 * 1000);
  };

  getZones = async () => {
    let floorID = $("#fname").val();
    this.wp = document.getElementById("temp").clientWidth;
    this.hp = document.getElementById("temp").clientHeight;
    await axios({
      method: "GET",
      url: zoneConfiguration + "?floorid=" + this.floorData[floorID].id,
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          $("#temp .sensors").remove();
          let wpx = this.wp / this.fWidth;
          let hpx = this.hp / this.fHeight;
          if (response.data.length !== 0) {
            let data = response.data;
            this.zonedata = data;
            $("#tempimg").attr(
              "style",
              "width:" + this.wp + "px;" + "height:" + this.hp + "px;"
            );
            for (let i = 0; i < data.length; i++) {
              let xaxis = 0, yaxis = 0;
              xaxis = parseInt(wpx * parseFloat(data[i].x1));
              yaxis = parseInt(hpx * parseFloat(data[i].y1));
              let width = Math.ceil((data[i].x2 - data[i].x1) * wpx);
              let height = Math.ceil((data[i].y2 - data[i].y1) * hpx);
              let childDiv1 = document.createElement("div");
              $(childDiv1).attr("id", data[i].zonename);
              $(childDiv1).attr("class", "sensors");
              $(childDiv1).attr(
                "style",
                "border:1px solid black;background:#00000033;" +
                "position: absolute; cursor: pointer; left:" +
                xaxis +
                "px; top:" +
                yaxis +
                "px;" +
                "width:" +
                width +
                "px;" +
                "height:" +
                height +
                "px;"
              );
              $(childDiv1).on("click", () => {
                this.setState({ zoneName: data[i].zonename })
                this.getGraphData(empDailyData, data[i].zonename, "opt0");
              });
              $("#temp").append(childDiv1);
            }
          }
        }
      })
      .catch((error) => {
        console.log("error===>", error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No zones data found.");
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /* panicData = () => {
    let fname = $("#fname").val();
    let alert_data = [];
    axios({
      method: "GET",
      url: "/api/alert/panic?floor=" + this.floorData[fname].id,
    })
      .then((response) => {
        console.log("alert_data-------->", response);
        if (response.status === 200) {
          let data = response.data;
          console.log("alert_data-------->", data);
          for (let i = 0; i < data.length; i++) {
            alert_data.push(data[i]);
          }
        }
      })
      .catch((error) => {
        console.log("error=====>", error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
    this.pilot_asset_inter = setTimeout(() => this.plotAssets(alert_data), 2 * 1000);
  }; */

  plotAssets = () => {
    let fname = $("#fname").val();
    // $("#track-error").text("");
    $("#temp #empls").remove();

    this.zones = [];
    for (let i = 0; i < this.zonedata.length; i++) {
      this.zones.push([0, 0]);
    }
    axios({
      method: "GET",
      url: "/api/employee/tracking?floor=" + this.floorData[fname].id,
    })
      .then((response) => {
        console.log("plotAssets response========>", response);
        if (response.status === 200) {
          $("#track-error").text("");
          let data = response.data;
          if (data.length !== 0) {
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx = document.getElementById("temp").clientHeight / this.fHeight;
            $("#lastupdated").css("display", "block");
            let totaltags = 0;
            let update_time = data[0].timestamp.substring(0, 19).replace("T", " ");
            $("#timing").text(update_time);
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                new Date() -
                new Date(data[i].timestamp.substring(0, 19).replace("T", " "));
              if (timestamp <= 2 * 60 * 1000) {
                let empDiv = document.createElement("div");
                $(empDiv).attr("id", "empls");
                $(empDiv).attr("class", "emp_" + data[i].tagid);
                let dd = data[i].tagid.substring(0, 11) === "5a-c2-15-01" ? "Employee " : "Asset ";
                $(empDiv).attr(
                  "title",
                  dd + "name : " + data[i].name +
                  "\nTag ID : " +
                  data[i].tagid +
                  "\nX : " +
                  data[i].x.toFixed(2) +
                  "\nY : " +
                  data[i].y.toFixed(2)
                );
                if (data[i].tagid.substring(0, 11) === "5a-c2-15-01") {
                  totaltags = totaltags + 1;
                  let color = "blue";
                  if (data[i].value === 1) {
                    color = "red";
                  } else if (data[i].value === 3) {
                    color = "yellow";
                  } else {
                    color = "blue";
                  }
                  let inner_circle = document.createElement("div");
                  $(inner_circle).attr(
                    "style",
                    "left:" +
                    (wpx * parseFloat(data[i].x) - 10).toFixed(2) + "px; top:" +
                    (hpx * parseFloat(data[i].y) - 10).toFixed(2) + "px;"
                  );
                  let pulse = document.createElement("div");
                  if (color === "red") {
                    $(inner_circle).attr("class", "inner_circle_red");
                    $(pulse).attr("class", "pulsatingcircle_red");
                  } else if (color === "yellow") {
                    $(inner_circle).attr("class", "inner_circle_yellow");
                    $(pulse).attr("class", "pulsatingcircle_yellow");
                  } else if (color === "blue") {
                    $(inner_circle).attr("class", "inner_circle_blue");
                    $(pulse).attr("class", "pulsatingcircle_blue");
                  }
                  $(inner_circle).append(pulse);
                  $(empDiv).append(inner_circle);
                }
                else {
                  totaltags = totaltags + 1;
                  let asseticon = document.createElement("i");
                  $(asseticon).attr("class", "far fa-medkit animate__animated animate__pulse animate__infinite");
                  $(asseticon).attr(
                    "style",
                    "color: #7e12b5;" +
                    "font-size : 16px;" +
                    "position: absolute;" +
                    "cursor: pointer;" +
                    "left:" + ((wpx * parseFloat(data[i].x)) - 10).toFixed(2) + "px; top: " +
                    ((hpx * parseFloat(data[i].y)) - 10).toFixed(2) + "px;"
                  );
                  $(empDiv).append(asseticon);
                }

                $("#temp").append(empDiv);
              }
            }

            let zoneData = this.zonedata;
            for (let i = 0; i < data.length; i++) {
              let timestamp = new Date() - new Date(data[i].timestamp.substring(0, 19).replace("T", " "));
              if (timestamp <= 2 * 60 * 1000) {
                for (let j = 0; j < zoneData.length; j++) {
                  if ((data[i].x >= zoneData[j].x1 && data[i].x <= zoneData[j].x2) &&
                    (data[i].y >= zoneData[j].y1 && data[i].y <= zoneData[j].y2)) {
                    if (data[i].tagid.substring(0, 11) === "5a-c2-15-01") {
                      this.zones[j][0] = this.zones[j][0] + 1;
                    } else {
                      this.zones[j][1] = this.zones[j][1] + 1;
                    }
                  }
                  /* if ((data[i].x >= 2 && data[i].x <= 10) &&
                    (data[i].y >= 2 && data[i].y <= 10)) {
                    if (data[i].tagid.substring(0, 11) === "5a-c2-15-01") {
                      this.zones[j][0] = this.zones[j][0] + 1;
                      break;
                    } else {
                      this.zones[j][1] = this.zones[j][1] + 1;
                      break;
                    }
                  } */
                }
              }
            }

            console.log("ZONE COUNT-----======>", this.zones);
            for (let k = 0; k < this.zonedata.length; k++) {
              $("#" + this.zonedata[k].zonename).attr("title",
                "ZoneName: " + this.zonedata[k].zonename +
                "\nEmployee : " + this.zones[k][0] +
                "\nAsset : " + this.zones[k][1]);
            }

            $("#total").text(totaltags);
            if ($("#temp").children("div").length === 0) {
              $("#track-error").text("No asset detected.");
            } else {
              $("#track-error").text("");
            }
          } else {
            $("#track-error").text(
              "No Asset is turned on, Please check System Health Page."
            );
          }
        } else {
          $("#track-error").text("Unable to get Tags Data.");
        }
      })
      .catch((error) => {
        $("#total").text(0);
        console.log("error=====>", error);
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No Asset data found.");
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  optionChange = (btnId) => {
    $("#opt0").css({ background: "none", color: "#000" });
    $("#opt1").css({ background: "none", color: "#000" });
    $("#opt2").css({ background: "none", color: "#000" });
    $("#" + btnId).css({ background: "rgb(0, 98, 135)", color: "#FFF" });
  };

  getGraphData = (apiurl, zonename, btnOpt) => {
    this.optionChange(btnOpt);
    this.setState({ error: false, message: '', series: [] })
    $("#graph_opt").css("display", "block");
    $("#chartID").text(zonename);
    let floorID = $("#fname").val();
    axios({
      method: "POST",
      url: apiurl,
      data: {
        floorid: this.floorData[floorID].id,
        zonename: zonename,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          console.log("graph====>", response)
          if (data.length !== 0) {
            let count = [];
            for (let i = 0; i < data.length; i++) {
              let time = data[i].timestamp;
              let date = new Date(time);
              let ms = date.getTime();
              count.push([ms, data[i].count]);
            }
            this.setState({
              series: [
                { name: 'Employee Count ', data: count }
              ]
            });
            this.setState({ loading: false });
            window.scrollTo(0, document.body.scrollHeight);
          } else {
            $("#track-error").text("No Graph Data Found");
            window.scrollTo(0, 0);
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No Graph Data Found");
          window.scrollTo(0, 0);
        } else {
          $("#track-error").text("Request Failed");
        }
      });
  };

  sessionTimeout = () => {
    $("#displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  search = () => {
    let id = $("#tagid").val();
    $("#track-error").text("");
    if (id.length === 0) {
      $("#track-error").text("Please Enter Tag ID.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#track-error").text("Invalid Tag ID entered.");
    } else if (id.length !== 0) {
      this.flag = "true";
      console.log("SEarch====", id);
      $("#track-error").text("Tag ID Not Found.");
      // $("#temp").children("div").css("display", "none");
      $("#temp #empls").css("display", "none");
      $("#temp .emp_" + id).css("display", "block");
    } else {
      $("#track-error").text("Asset Not Found.");
    }
  };

  render() {
    const { zoneName, chartOpts, loading, series } = this.state;
    return (
      <Fragment>
        <>
          <title>Realtime Tracking</title>
        </>
        <div style={{ float: "right", width: "91%", marginTop: "90px" }}>
          <span className="main-heading">REALTIME TRACKING</span>
          <p className="underLine" />
          <div className="container fading">
            <div className="row">
              <div className="input-group">
                <span className="label">Floor Name : </span>
                <select
                  name="type"
                  id="fname"
                  onChange={() => {
                    this.plotFloorMap();
                  }}
                ></select>
              </div>
            </div>

            <div id="floorBlock" style={{ display: "none" }}>
              <div className="row">
                <div className="input-group">
                  <span className="label">Tag MAC ID : </span>
                  <input
                    type="text"
                    id="tagid"
                    placeholder="5a-c2-15-00-00-00"
                    required="required"
                    onClick={() => $("#track-error").text("")}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="button"
                    value="Search"
                    onClick={this.search}
                    className="btn success-btn"
                  />
                  &nbsp;&nbsp;
                  <input
                    type="button"
                    value="Clear"
                    onClick={() => {
                      $("#temp").children().css("display", "block");
                      document.getElementById("tagid").value = "";
                      document.getElementById("track-error").innerHTML = "";
                      this.flag = "false";
                    }}
                    className="btn success-btn"
                  />
                </div>
              </div>
              <p className="error-msg" id="track-error"></p>
              <div className="row sub-heading" style={{ color: "black" }}>
                <hr></hr>

                {/*<div style={{ fontSize: "19px", margin: "20px 0" }} className="row sub-heading">
                  <div
                    className="square-circle"
                    style={{
                      backgroundColor: "blue",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  ></div>
                  Normal
                  <div
                    className="square-circle"
                    style={{
                      backgroundColor: "yellow",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Free fall
                  <div
                    className="square-circle"
                    style={{
                      backgroundColor: "rgba(255,0, 0,1)",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>Panic
                  <div
                    className="far fa-medkit"
                    style={{
                      // backgroundColor: "blue",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: '20px'
                    }}
                  ></div>
                  Asset
                  </div> */}

                <div style={{
                  display: 'flex', width: "700px",
                  justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    Total Tags :
                    <u>
                      <span id="total">0</span>
                    </u>
                  </div>
                  <div className="sub-heading"
                    style={{ color: "#000" }}
                    id="lastupdated">
                    Last Updated : <span id="timing">00:00:00</span>{" "}
                  </div>
                </div>
              </div>
              <div
                id="temp"
                style={{
                  display: "block",
                  position: "relative",
                  width: "fit-content",
                }}>
                <img id="tempimg" alt=""></img>
              </div>
              <div id="graph_opt"
                style={{ display: "none", marginBottom: "15px", width: "97%" }}>
                <hr></hr>
                <div className="sub-heading" style={{ textDecoration: "none" }}>
                  Employee Occupancy : <span id="chartID"></span>
                </div>
                <br></br>
                <button
                  id="opt0"
                  className="heading"
                  style={graphBtn}
                  onClick={() => this.getGraphData(empDailyData, zoneName, "opt0")}
                >
                  Daily Count
                </button>
                <button
                  id="opt1"
                  className="heading"
                  style={graphBtn}
                  onClick={() => this.getGraphData(empWeeklyData, zoneName, "opt1")}
                >
                  Weekly Count
                </button>
                <button
                  id="opt2"
                  className="heading"
                  style={graphBtn}
                  onClick={() => this.getGraphData(empMonthlyData, zoneName, "opt2")}
                >
                  Monthly Count
                </button>

                {series.length > 0 ? (
                  <div style={{ width: "95%" }}>
                    <div
                      id="chart-timeline">
                      <ApexCharts
                        options={chartOpts}
                        series={series}
                        type="area"
                        height={380} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {loading === true && (
            <div
              style={{
                top: "0%",
                left: "0%",
              }} className="frame">
              <DataLoading />
            </div>
          )}
          {/* Display modal to display error messages */}
          <div id="displayModal" className="modal">
            <div className="modal-content">
              <p id="content" style={{ textAlign: "center" }}></p>
              <button
                id="ok"
                className="btn-center btn success-btn"
                onClick={this.sessionTimeout}>
                OK
              </button>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Tracking;
