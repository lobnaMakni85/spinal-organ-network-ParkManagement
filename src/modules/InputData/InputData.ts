/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import {
  InputDataDevice,
  InputDataEndpoint,
  InputDataEndpointGroup,
  InputDataEndpointDataType,
  InputDataEndpointType
} from "./InputDataModel/InputDataModel";

type onDataFunctionType = (obj: InputDataDevice) => void;

/**
 * Simulation Class to generate data from an extrenal source
 *
 * @class InputData
 */
class InputData {
  /**
   * @private
   * @type {onDataFunctionType}
   * @memberof InputData
   */
  private onData: onDataFunctionType;

  /**
   * @private
   * @type {InputDataDevice[]}
   * @memberof InputData
   */
  private devices: InputDataDevice[];
  

  /**
   *Creates an instance of InputData.
   * @memberof InputData
   */
  constructor() {
    const intervalTest = 1000;
    this.devices = [];
    this.onData = null;
    this.generateData();
    setInterval(this.onDataInterval.bind(this), intervalTest);
  }

  /**
   * @private
   * @memberof InputData
   */
  private onDataInterval() {
    if (this.onData !== null) {
      this.onData(this.getAndUpdateOneRandomDevice());
    }
  }

  /**
   * @param {onDataFunctionType} onData
   * @memberof InputData
   */
  public setOnDataCBFunc(onData: onDataFunctionType): void {
    this.onData = onData;
  }


  getToken(){

  const  url = 'http://10.50.11.20/CP3Service/public/CP3WebInterface.wsdl';

  const soapRequest = require('easy-soap-request');
  
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cp3="http://10.50.11.20/CP3Service/public/CP3WebInterface">

              <soapenv:Header/>
           
              <soapenv:Body>
           
                 <cp3:login>
           
                    <username>"BOS"</username>
           
                    <password>"21232f297a57a5a743894a0e4a801fc3"</password>
           
                 </cp3:login>
           
              </soapenv:Body>
           
           </soapenv:Envelope>`;
              
  // usage of module
  (async () => {
    const { response } = await soapRequest({ url: url, xml: xml, timeout: 1000 }); // Optional timeout parameter(milliseconds)
    const { headers, body, statusCode } = response;
    console.log("HEADERS**********")
    console.log(headers);
    console.log("BODY**********")
    console.log(body);
    console.log("STATUS CODE**********")
    console.log(statusCode);
  })();
  return new Promise((resolve)=>{xml2js.parseString(body,(err:any, result:any)=>{
    resolve(result["SOAP-ENV:Envelope"]['SOAP-ENV:Body'][0]["ns1:loginResponse"][0].token[0]);
    });
        console.log("STATUS CODE**********")
        console.log(statusCode);
    
     });
    
  }

 async getRtStatusBays(token){
    if(!token){
      token=await this.getToken();
    
    const xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cp3="http://localhost/CP3Service/public/CP3WebInterface">

    <soapenv:Header/>
 
    <soapenv:Body>
 
       <cp3:getRtBaysStatus>
 
          <token>${token}</token>
 
       </cp3:getRtBaysStatus>
 
    </soapenv:Body>
 
 </soapenv:Envelope>`;
  }

  }

  /**
   * @private
   * @memberof InputData
   */
  private generateData() {
 
      let device = this.generateDataDevice();
      this.devices.push(device);
      this.updateDevice(device);
    
  }

  /**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private generateDataDevice(): InputDataDevice {
    function createFunc(
      str: string,
      type: string,
      constructor: typeof InputDataDevice | typeof InputDataEndpointGroup
    ): any {
      return new constructor(str, type, str, "");
    }

    const res: InputDataDevice = createFunc(
      `Capteur_parking`,
      "device",
      InputDataDevice
    );
for (let i = 0; i < 10; i++) {
      
const CHILD_1: InputDataEndpoint = new InputDataEndpoint(
      `alarme_panne_capteur_Bay_${i}`,
      "alarme",
      "",                                            
      InputDataEndpointDataType.Boolean,
      InputDataEndpointType.Occupation,
      `DEVICE-${i} alarme_panne_capteur_Bay`
); 

const CHILD_2: InputDataEndpoint = new InputDataEndpoint(
      `status_Bay_${i}` ,
      "status",
      "",
      InputDataEndpointDataType.Boolean,
      InputDataEndpointType.Occupation,
      `DEVICE-${i} status_Bay`
      );  

    res.children.push(CHILD_1, CHILD_2);
}
    return res;
  }

  /**
   * @private
   * @param {(InputDataDevice|InputDataEndpointGroup)} deviceOrEnpointGroup
   * @memberof InputData
   */
  private updateDevice(
    deviceOrEnpointGroup: InputDataDevice | InputDataEndpointGroup
  ): void {
    
    let randBool = 0;

    for (const child of deviceOrEnpointGroup.children) {
      if (child instanceof InputDataEndpoint) {
        /*c'est ici que je dois faire ma requete*/
          randBool = Math.random() ;
          if (randBool >= 0.5) {
            child.currentValue = true;
          } else {
            child.currentValue = false;
          }
        
        console.log(child.currentValue);
        }
       else if (
        child instanceof InputDataDevice ||
        child instanceof InputDataEndpointGroup
      ) {
        this.updateDevice(child);
      }
    }
  }

  /**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private getAndUpdateOneRandomDevice(): InputDataDevice {

    if (this.devices.length > 0) {

      const idx = Math.floor(Math.random() * this.devices.length);
      this.updateDevice(this.devices[idx]);
      return this.devices[idx];
    }
    this.generateData();
    return this.getAndUpdateOneRandomDevice();
  }
}

export { InputData };
