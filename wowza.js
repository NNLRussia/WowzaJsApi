'use strict'

let http = require('http'),
	querystring = require('querystring');

/**
 *This class is JavaScript wrapper for cURL REST API for Wowza Streaming Engine server <br>
 * _tested with NodeJS version 6.10.2 LTS_
 *
 * @class WowzaAPI
 * @extends Object
 * @param {Object} [options] possible to set stream parametres which will use as default for methods
 * @param {string} [options.wowzaAdress = 'localhost'] IP address or domein name of Wowza Streaming Engine
 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile
 * @param {string} [options.application = 'application'] name of an application
 * @param {string} [options.appInstance = '_definst_'] name of an application instance
 * @param {string} [options.mediaCasterType = 'rtp'] caster type
 * 
 * @example
 * let Wowza = require('./wowza.js');
 *	wowza = new Wowza({
 *		wowzaAdress: '192.168.1.15',   // default value is 'localhost'
 *		streamFile: 'ipCamera.stream', // default is 'myStream.stream'
 *		application: 'webrtc',         // default is 'live'
 *		appIstance: '_definst_',       // default is '_definst_'
 *		mediaCasterType: 'rtp'         // default is 'rtp'
 *	});
 * wowza.someWowzaMethod(); // now you can use the JS wowza API.
 * 
 */

class WowzaAPI {

	constructor(options) {
		this.wowzaAdress = options.wowzaAdress || 'localhost';
		this.application = options.application || 'live';
		this.streamFile = options.streamFile || 'myStream.stream';
		this.appInstance = options.appInstance || '_definst_';
		this.mediaCasterType = options.mediaCasterType || 'rtp';
		this.commonRequestUrl = `http://${this.wowzaAdress}:8087`;

		this.httpOptions = {
			host: this.wowzaAdress,
			port: '8087',
			path: '/v2/servers/_defaultServer_/vhosts/_defaultVHost_',
			method: 'PUT',
			headers: {
				'Accept': 'application/json; charset=utf-8',
				'Content-Type': 'application/json; charset=utf-8'
			}
		}
	}

	/**
	 *Get a list of streamfiles
	 *
	 * @function getStreamFilesList
	 * @param {Object} [options]
	 * @param {string}  [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve by object which contains array of streamFiles and it's confifurations 
	 *
	 * @example 
	 * wowza.getStreamFilesList({application: 'webrtc', streamFile: 'ipCamera'})
	 * 	.then( responseMsg => console.log(responseMsg))
	 * 	.catch( errorMsg => console.log(errorMsg));
	 *
	 * // Wowza answer example:
	 * //{serverName: '_defaultServer_', streamFiles: [{id: 'ipCamera2', href: '/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/webrtc/streamfiles/ipCamera2'}]} 
	 */
	getStreamFilesList(options) {

		let application = this.application;
		if (options && options.application) application = options.application;

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.method = 'GET';
			options.path = `${this.httpOptions.path}/applications/${application}/streamfiles`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', (e) => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	/**
	 *Get specific stream configuration
	 *
	 * @function getStreamConfiguration
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve by stream configurations object 
	 *
	 * @example 
	 * wowza.getStreamConfiguration()
	 *	.then(response => console.log(response))
	 *	.catch(errorMsg => console.log(errorMsg));
	 * // Wowza answer example: 
	 * // {version: '1488715914000', serverName: '_defaultServer_', uri: 'rtsp://admin:admin@192.168.42.231', name: 'ipCamera'}
	 */
	getStreamConfiguration(options) {

		let application = this.application;
		let streamFile = this.streamFile;

		if (options) {
			application = options.application || this.application;
			streamFile = options.streamFile || this.streamFile;
		}

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.method = 'GET';
			options.path = `${this.httpOptions.path}/applications/${application}/streamfiles/${streamFile}`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', (e) => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	/**
	 *Create Recorder
	 *
	 * @method createRecorder
	 * @param {Object} recorderParametres
	 * @param {string} recorderParametres.restURI 
	 * @param {string} recorderParametres.recorderName 
	 * @param {string} recorderParametres.instanceName 
	 * @param {string} recorderParametres.recorderState 
	 * @param {boolean} recorderParametres.defaultRecorder 
	 * @param {string} recorderParametres.segmentationType 
	 * @param {string} recorderParametres.outputPath  default value is [] and wowza should save files in [install-dir]/content, not tested
	 * @param {string} recorderParametres.baseFile  default is [], and wowza should name file as a streamfile name, not tested
	 * @param {string} recorderParametres.fileFormat 
	 * @param {string} recorderParametres.fileVersionDelegateName 
	 * @param {string} recorderParametres.fileTemplate 
	 * @param {number} recorderParametres.segmentDuration 
	 * @param {number} recorderParametres.segmentSize 
	 * @param {string} recorderParametres.segmentSchedule 
	 * @param {boolean} recorderParametres.recordData 
	 * @param {boolean} recorderParametres.startOnKeyFrame 
	 * @param {boolean} recorderParametres.splitOnTcDiscontinuity 
	 * @param {number} recorderParametres.backBufferTime 
	 * @param {string} recorderParametres.option should to work with one of: version | append | overwrite, but not tested
	 * @param {boolean} recorderParametres.moveFirstVideoFrameToZero 
	 * @param {number} recorderParametres.currentSize 
	 * @param {number} recorderParametres.currentDuration 
	 * @param {string} recorderParametres.recordingStartTime 
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.appInstance = '_definst_'] name of an instance (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve when rec will start  
	 * @example
	 * wowza.createRecorder({
	 * 	"restURI": "http://192.168.1.15:8087/v2/servers/_defaultServer_/vhosts/_defaultVHost_/applications/webrtc/instances/_definst_/streamrecorders/ipCamera.stream",
	 * 	"recorderName": "ipCameraRecorder",
	 * 	"instanceName": "_definst_",
	 * 	"recorderState": "Waiting for stream",
	 * 	"defaultRecorder": true,
	 * 	"segmentationType": "None",
	 * 	"outputPath": "", // default value is [] and wowza save files in [install-dir]/content, not tested
	 * 	"baseFile": "myrecord2.mp4", // default is [], and wowza will name file as a streamfile name, not tested
	 * 	"fileFormat": "MP4",
	 * 	"fileVersionDelegateName": "com.wowza.wms.livestreamrecord.manager.StreamRecorderFileVersionDelegate",
	 * 	"fileTemplate": "${BaseFileName}_${RecordingStartTime}_${SegmentNumber}",
	 * 	"segmentDuration": 900000,
	 * 	"segmentSize": 10485760,
	 * 	"segmentSchedule": "0 * * * * *",
	 * 	"recordData": true,
	 * 	"startOnKeyFrame": true,
	 * 	"splitOnTcDiscontinuity": false,
	 * 	"backBufferTime": 3000,
	 * 	"option": "Version existing file", //should to work with one of: version | append | overwrite, but not tested
	 * 	"moveFirstVideoFrameToZero": true,
	 * 	"currentSize": 0,
	 * 	"currentDuration": 0,
	 * 	"recordingStartTime": ""
	 * },{
	 * 	streamFile: 'ipCamera', 
	 * 	application: 'webrtc',
	 * 	appIstance: '_definst_'
	 * })
	 * 	.then(response => console.log(response))
	 * 	.catch(errorMsg => console.log(errorMsg));
	 * // Wowza answer example: 
	 * //{ success: true, message: 'Recorder Created', data: null }
	 */
	createRecorder(recorderParametres, options) {

		let application = this.application;
		let streamFile = this.streamFile;
		let appInstance = this.appInstance;

		if (options) {
			application = options.application || this.application;
			streamFile = options.streamFile || this.streamFile;
			appInstance = options.appInstance || this.appInstance;
		}

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.method = 'POST';
			options.path = `${this.httpOptions.path}/applications/${application}/instances/${appInstance}/streamrecorders/${streamFile}`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', () => {throw new Error(`problem with request: ${e.message}`)});

			//write parametres
			req.write(JSON.stringify(recorderParametres));
			req.end();
		});
	}

	/**
	 * Stop recording
	 *
	 * @method stopRecording
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.appInstance = '_definst_'] name of an instance (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve when rec will stop
	 * @example
	 * wowza.stopRecording({
	 * 	streamFile: 'ipCamera', 
	 * 	application: 'webrtc',
	 * 	appIstance: '_definst_'
	 * }).then(response => console.log(response)).catch(errorMsg => console.log(errorMsg));
	 * // Wowza answer example: 
	 * // { success: true, message: 'Recording (ipCamera) stopped', data: null }
	 */
	stopRecording(options) {

		let application = this.application;
		let streamFile = this.streamFile;
		let appInstance = this.appInstance;

		if (options) {
			application = options.application || this.application;
			streamFile = options.streamFile || this.streamFile;
			appInstance = options.appInstance || this.appInstance;
		}

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.method = 'PUT';
			options.path = `${this.httpOptions.path}/applications/${application}/instances/${appInstance}/streamrecorders/${streamFile}/actions/stopRecording`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', () => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	/**
	 * Get a list of recorders
	 *
	 * @method getRecordersList
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.appInstance = '_definst_'] name of an instance (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve by object contains recorders params array
	 * @example
	 * wowza.getRecordersList({
	 * 	application: 'webrtc',
	 * 	appIstance: '_definst_'
	 * }).then( response => console.log(response)).catch( errorMsg => console.log(errorMsg));
	 * // Wowza answer example: 
	 * //{ serverName: '_defaultServer_',
	 * //  instanceName: '_definst_',
	 * //  streamrecorder: 
	 * //   [ { recorderName: 'ipCamera',
	 * //       instanceName: '_definst_',
	 * //       recorderState: 'Waiting for stream',
	 * //       defaultRecorder: false,
	 * //       segmentationType: 'None',
	 * //       outputPath: '/usr/local/WowzaStreamingEngine/content/records',
	 * //       baseFile: 'myrecord2.mp4',
	 * //       fileFormat: 'MP4',
	 * //       fileVersionDelegateName: 'com.wowza.wms.livestreamrecord.manager.StreamRecorderFileVersionDelegate',
	 * //       fileTemplate: '${BaseFileName}_${RecordingStartTime}_${SegmentNumber}',
	 * //       segmentDuration: 900000,
	 * //       segmentSize: 10485760,
	 * //       segmentSchedule: '0 * * * * *',
	 * //       recordData: true,
	 * //       startOnKeyFrame: true,
	 * //       splitOnTcDiscontinuity: false,
	 * //       backBufferTime: 3000,
	 * //       option: 'Version existing file',
	 * //       moveFirstVideoFrameToZero: true,
	 * //       currentSize: 0,
	 * //       currentDuration: 0,
	 * //       recordingStartTime: '' } ] }
	 */
	getRecordersList(options) {

		let application = this.application;
		let appInstance = this.appInstance;

		if (options) {
			application = options.application || this.application;
			appInstance = options.appInstance || this.appInstance;
		}

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.method = 'GET';
			options.path = `${this.httpOptions.path}/applications/${application}/instances/${appInstance}/streamrecorders`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', (e) => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	/**
	 *Connect a existing streamfile
	 *
	 * @method connectStreamFile
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.appInstance = '_definst_'] name of an instance (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.mediaCasterType = 'rtp'] caster type (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve when stream will connect
	 * @example	 
	 * wowza.connectStreamFile({
	 * 	streamFile: 'ipCamera',
	 * 	application: 'webrtc',
	 * 	appIstance: '_definst_'
	 * }).then( response => console.log(response)).catch( errorMsg => console.log(errorMsg));
	 * //Wowza answer example:
	 * //{ success: true, message: 'Publish stream successfully started [webrtc/_definst_]: mp4:ipCamera.stream', data: null }
	 */
	connectStreamFile(options) {

		let application = this.application;
		let streamFile = this.streamFile;
		let appInstance = this.appInstance;
		let mediaCasterType = this.mediaCasterType;

		if (options) {
			application = options.application || this.application;
			streamFile = options.streamFile || this.streamFile;
			appInstance = options.appInstance || this.appInstance;
			mediaCasterType = options.mediaCasterType || mediaCasterType;
		}

		return new Promise((resolve, reject) => {

			//getting request query string
			let data = querystring.stringify({
				connectAppName: application,
				appInstance: appInstance,
				mediaCasterType: mediaCasterType
			});

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.path = `${this.httpOptions.path}/streamfiles/${ this._checkStreamFileName(streamFile) }/actions/connect?${data}`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));
			req.on('error', (e) => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	/**
	 * Disconnect a existing stream file
	 *
	 * @method disconnectStreamFile
	 * @param {Object} [options]
	 * @param {string} [options.application = 'live'] name of an application (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.streamFile = 'myStream.stream'] name of a streamfile (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.appInstance = '_definst_'] name of an instance (default value can be another if it was passed to the class constructor)
	 * @param {string} [options.mediaCasterType = 'rtp'] caster type (default value can be another if it was passed to the class constructor)
	 * @return {Promise} promise which resolve when stream will connect
	 * @example	 
	 * wowza.disconnectStreamFile({
	 * 	streamFile: 'ipCamera.stream',
	 * 	application: 'webrtc',
	 * 	appIstance: '_definst_'
	 * }).then( response => console.log(response)).catch( errorMsg => console.log(errorMsg));
	 * //Wowza answer example:
 	 * //{ success: true, message: ''Publish stream successfully stopped [webrtc/_definst_]: mp4:ipCamera.stream'',data: null }
	 */
	disconnectStreamFile(options) {

		let application = this.application;
		let streamFile = this.streamFile;
		let appInstance = this.appInstance;
		let mediaCasterType = this.mediaCasterType;

		if (options) {
			application = options.application || this.application;
			streamFile = options.streamFile || this.streamFile;
			appInstance = options.appInstance || this.appInstance;
			mediaCasterType = options.mediaCasterType || mediaCasterType;
		}

		return new Promise((resolve, reject) => {

			//getting a clone of the common httpOptions object and change it's path to necessary
			let options = Object.assign({}, this.httpOptions);
			options.path = `${this.httpOptions.path}/applications/${application}/instances/${appInstance}/incomingstreams/${streamFile}/actions/disconnectStream`;

			//getting request object
			let req = http.request(options, this.responceHandler(resolve, reject));

			req.on('error', (e) => {throw new Error(`problem with request: ${e.message}`)});

			req.end();
		});
	}

	// handler for responses from wowza engine, if wowza response status 200 handler resolve promise 
	responceHandler(resolve, reject) {

		return (res) => {
			if (res.statusCode < 300) {

				let responceData = {};
				res.on('data', (chunk) => responceData = JSON.parse(chunk));
				res.on('end', () => resolve(responceData));

			} else {
				reject(res.statusMessage);
			}
		}
	}

	// for debugging with write a data to console
	testRresponceHandler(resolve, reject) {

		return (res) => {
			//console.log(res.getHeaders());
			console.log('status');
			console.log(res.statusCode);
			if (res.statusCode < 300) {

				console.log(res.statusMessage);

				let responceData = {};
				res.on('data', (chunk) => {
					responceData = JSON.parse(chunk);
					console.log('DATA');
					console.log(responceData);
				});
				res.on('end', () => {
					console.log('END RESPONSE');
					resolve(responceData)
				});

			} else {
				reject(res.statusMessage);
			}
		}
	}

	// Connect streamfile wowza http method works only for streamfiles which name pattern is: [name].stream, 
	// and URL connect stream method need only [name] part for identificate streamfile.
	// others URL methods works with all named streamfils and need full name in params.
	// This way, necessary checking '.stream' at the end of the streamFile while connect to streamfile. 
	_checkStreamFileName(streamFile) {
		let splitted = streamFile.split('.');
		return splitted.pop() === 'stream' ? splitted.join('.') : streamFile;
	}
}

module.exports = WowzaAPI;
