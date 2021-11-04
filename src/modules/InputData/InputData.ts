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
const xml2js = require("xml2js");
const soapRequest = require('easy-soap-request');
import * as lodash from "lodash";
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
  private token :any=null;  
  private bays:any;

  /**
   *Creates an instance of InputData.
   * @memberof InputData
   */
  constructor() {
    const intervalTest = 1000*60;
    this.devices = [];
    this.onData = null;
    
    this.getBays().then(async (bays)=>{
      //console.log(bays)
      this.bays=bays;
      await this.generateData(this.bays);
      setInterval(this.onDataInterval.bind(this), intervalTest);
    })

    
  }

  /**
   * @private
   * @memberof InputData
   */
  private async onDataInterval() {
    if (this.onData !== null) {
      let rtData= await this.getRtStatusBays();
      this.onData(await this.getAndUpdateOneRandomDevice(rtData));
    }
  }

  /**
   * @param {onDataFunctionType} onData
   * @memberof InputData
   */
  public setOnDataCBFunc(onData: onDataFunctionType): void {
    this.onData = onData;
  }


async  getToken(){
const  url = 'http://10.50.11.20/CP3Service/public/CP3WebInterface.php';
  
  console.log("access function token")
  const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cp3="http://10.50.11.20/CP3Service/public/CP3WebInterface">

              <soapenv:Header/>
           
              <soapenv:Body>
           
                 <cp3:login>
           
                    <username>BOS</username>
           
                    <password>21232f297a57a5a743894a0e4a801fc3</password>
           
                 </cp3:login>
           
              </soapenv:Body>
           
           </soapenv:Envelope>`;
              
  // usage of module
try{  const { response } = await soapRequest({ url: url, xml: xml}); // Optional timeout parameter(milliseconds)
    const { headers, body, statusCode } = response;
    console.log("access function token")
    console.log("HEADERS**********")
    console.log(headers);
    console.log("BODY**********")
return new Promise((resolve)=>{xml2js.parseString(body,(err:any, result:any)=>{
console.log(result["SOAP-ENV:Envelope"]['SOAP-ENV:Body'][0]["ns1:loginResponse"][0].token[0]);
resolve(result["SOAP-ENV:Envelope"]['SOAP-ENV:Body'][0]["ns1:loginResponse"][0].token[0]);
this.token=result["SOAP-ENV:Envelope"]['SOAP-ENV:Body'][0]["ns1:loginResponse"][0].token[0];
});
    console.log("STATUS CODE**********")
    console.log(statusCode);

 });}
catch(e){console.log(e);}

}


 async getRtStatusBays(){
  const  url = 'http://10.50.11.20/CP3Service/public/CP3WebInterface.php';

  //const soapRequest = require('easy-soap-request');
  
    if(this.token==null){
      this.token=await this.getToken();
console.log("recherche token")   
 }
else{
console.log("*************************",this.token);
    const xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cp3="http://10.50.11.20/CP3Service/public/CP3WebInterface">

    <soapenv:Header/>
 
    <soapenv:Body>
 
       <cp3:getRtBaysStatus>
 
          <token>${this.token}</token>
 
       </cp3:getRtBaysStatus>
 
    </soapenv:Body>
 
 </soapenv:Envelope>`;
  try{
  const { response } = await soapRequest({ url: url, xml: xml }); // Optional timeout parameter(milliseconds)
  const { headers, body, statusCode } = response; 
// console.log("HEADERS**********")
  //  console.log(headers);
   // console.log("BODY**********")
  //  console.log(body);
   // console.log("STATUS CODE**********")
   // console.log(statusCode);

return new Promise((resolve)=>{xml2js.parseString(body,(err:any, result:any)=>{
const bays=result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:getRtBaysStatusResponse"][0]["rtBaysStatusList"][0]["ns2:RtBayStatus"];
//console.log(JSON.stringify(bays));
const bay=bays.map((el:any)=> {
return {id:el["ns2:idbay"][0],
status:el["ns2:status"][0],
category:el["ns2:idcategory"][0]

}
})
resolve(bay);
//console.log(bay)

})});

    }

catch(error){
console.log(error)
/*if (error.reponse.statusCode == 401) {
  
		  console.log("error 401")
		  await this.getToken()
		   
		}*/
}
}
}


async getBays(){
  const  url = 'http://10.50.11.20/CP3Service/public/CP3WebInterface.php';

  //const soapRequest = require('easy-soap-request');

    if(this.token==null){
      this.token=await this.getToken();
console.log("recherche token")
 }
//else{
console.log("*************************",this.token);
    const xml=`<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cp3="http://10.50.11.20/CP3Service/public/CP3WebInterface">

    <soapenv:Header/>

   <soapenv:Body>

      <cp3:getBays>

         <token>${this.token}</token>

      </cp3:getBays>

   </soapenv:Body>

</soapenv:Envelope>`;
  try{
  const { response } = await soapRequest({ url: url, xml: xml }); // Optional timeout parameter(milliseconds)
  const { headers, body, statusCode } = response;
   //console.log("HEADERS**********")
   //console.log(headers);
   //console.log("BODY**********")
   //console.log(body);
  // console.log("STATUS CODE**********")
   //console.log(statusCode);

return new Promise((resolve)=>{xml2js.parseString(body,(err:any, result:any)=>{
const bays=result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:getBaysResponse"][0]["baysList"][0]["ns2:Bay"];
//console.log("*************KEYS"+Object.keys(bays));
//console.log("************JSON"+JSON.stringify(bays));
const bay=bays.map((el:any)=> {
  //const name=el["ns2:name"][0];
  return {id:el["ns2:idbay"][0],
  name:el["ns2:name"][0],
  etage:el["ns2:name"][0].split(" ")[0].split("")[0],
  zone:el["ns2:name"][0].split(" ")[0].split("")[1],
  numero:el["ns2:name"][0].split(" ")[1]
  }
  })
  resolve(bay);
  //console.log(bay)

})});

    }

catch(error){
console.log(error)
/*if (error.reponse.statusCode == 401) {
  
                  console.log("error 401")
                  await this.getToken()

                }*/
}
//}
}


  /**
   * @private
   * @memberof InputData
   */
  private async generateData(data:any) {
    try{
      if(this.bays!=null){
        console.log("*************BAYS")
        //data.forEach((element:any) => {
        let device = this.generateDataDevice(data);
        console.log(device)
        //this.devices.push(device);
        
        //});
        //this.updateDevice(device);
    }
  }
  catch(e){
  console.log(e)
  }
  }

/**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private generateDataDevice(data:any): InputDataDevice {
    function createFunc(
      name: string,
      type:string,
      id: string,
      path:string,
      constructor: typeof InputDataDevice | typeof InputDataEndpointGroup
    ): any {
      return new constructor(name,type,id,path)
    }
    //console.log(data)
const res: InputDataDevice = createFunc("Parking","device","id", "",InputDataDevice);
  
	  data.forEach((element:any)=> {
		const child: InputDataEndpoint = new InputDataEndpoint(
		  element.numero,
		  false,
		  "",
		  InputDataEndpointDataType.Boolean,
		  InputDataEndpointType.Other,
		  element.id,
		  element.name
		);
		res.children.push(child)
	  });
  
  
	  this.devices.push(res)
	  return res;
    /*const res: InputDataDevice = createFunc(
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
    return res;*/
  }



  /**
   * @private
   * @param {(InputDataDevice|InputDataEndpointGroup)} deviceOrEnpointGroup
   * @memberof InputData
   */
  private async updateDevice(
    deviceOrEnpointGroup: InputDataDevice | InputDataEndpointGroup
  ): Promise<any> {
    
    
    
  }

  /**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private async  getAndUpdateOneRandomDevice(data:any) {
//this.token = await this.getToken();
//console.log("la liste des voitures ************")
//const b:any= await this.getBays();
console.log("état des voitures ---------------------------------");
//const rtstate:any= await this.getRtStatusBays();
//const corres:any=lodash.values(lodash.merge(lodash.keyBy(b,'id'),lodash.keyBy(rtstate,'id')));
//console.log(corres)
    if (this.devices.length > 0) {
      const idx = Math.floor(Math.random() * this.devices.length);
      this.updateDevice(this.devices[idx]);
      return this.devices[idx];
    }
    this.generateData(data);
    //return this.getAndUpdateOneRandomDevice(data);
  }
}

export { InputData };