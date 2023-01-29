import {trackVoiceGainNode, untrackVoiceGainNode, VoiceModule} from "../VoiceModule";
import {WorldModule} from "../../world/WorldModule";
import {getGlobalState, setGlobalState} from "../../../../state/store";
import {applyPannerSettings, untrackPanner} from "../../../../views/client/pages/settings/SettingsPage";
import {Position} from "../../../util/math/Position";
import {Vector3} from "../../../util/math/Vector3";
import {Hark} from "../../../util/hark";

export class PeerStream {

    constructor(peerStreamKey, volume) {
        this.peerStreamKey = peerStreamKey;
        this.volume = volume;
        this.volBooster = 1.5;
        this.harkEvents = null;
        this.pannerId = null;
        this.globalVolumeNodeId = null;
        this.useSpatialAudio = getGlobalState().settings.voicechatSurroundSound;
        this.pannerNode = null;

        this.x = 0;
        this.y = 0;
        this.z = 0;

        this.masterOutputNode = null;
    }

    // callback has a boolean attached to it, true if the stream loaded, or false if it got rejected
    startStream(callback) {
        // request the stream
        let streamRequest = VoiceModule.peerManager.requestStream(this.peerStreamKey);

        // when the stream is ready, we can start it

        // TODO: Rewrite research, can we drop the audio tag?
        streamRequest.onFinish(stream => {
            // player context
            const ctx = WorldModule.player.audioCtx;
            this.gainNode = ctx.createGain();
            this.setVolume(this.volume);
            this.audio = new Audio();
            this.audio.autoplay = true;
            this.audio.srcObject = stream;
            this.gainNode.gain.value = (this.volume / 100) * this.volBooster;
            this.audio.muted = true; // mute the audio element, we don't want to hear it, gain node already does that

            let source = ctx.createMediaStreamSource(this.audio.srcObject);

            // speaking indicator
            this.harkEvents = new Hark(stream);
            this.harkEvents.setThreshold(-75);
            this.harkEvents.on('speaking', () => {
                setGlobalState({voiceState: {peers: {[this.peerStreamKey]: {speaking: true}}}});
            });

            this.harkEvents.on('stopped_speaking', () => {
                setGlobalState({voiceState: {peers: {[this.peerStreamKey]: {speaking: false}}}});
            });

            // spatial audio handling, depends on the settings
            let outputNode = null;

            if (this.useSpatialAudio) {
                this.pannerNode = ctx.createPanner();
                this.pannerId = applyPannerSettings(this.pannerNode);
                this.setLocation(this.x, this.y, this.z, true);
                source.connect(this.gainNode);
                this.gainNode.connect(this.pannerNode);
                outputNode = this.pannerNode;
            } else {
                // just do gain
                source.connect(this.gainNode);
                outputNode = this.gainNode;
            }

            let globalVolumeGainNode = ctx.createGain();
            outputNode.connect(globalVolumeGainNode);

            this.globalVolumeNodeId = trackVoiceGainNode(globalVolumeGainNode);

            this.masterOutputNode = globalVolumeGainNode;

            globalVolumeGainNode.connect(ctx.destination);

            // start stream
            this.audio.play()
                .then(() => {
                    this.setVolume(this.volume);
                    callback(true);
                })
                .catch((e) => {
                    callback(false);
                    console.error(e);
                });
        })

        streamRequest.onReject(() => {
            callback(false);
        });
    }

    setLocation(x, y, z, update) {
        // is surround enabled?
        if (!this.useSpatialAudio) return;

        if (update && this.pannerNode !== null) {
            let position = new Position(new Vector3(x, y, z));
            position.applyTo(this.pannerNode);
        } else if (update) {
            console.warn("Tried to update location of peer stream, but panner node is null");
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.gainNode !== null) {
            this.gainNode.gain.value = (volume / 100) * this.volBooster;
        }
    }

    stop() {
        if (this.pannerId !== null) {
            untrackPanner(this.pannerId);
            untrackVoiceGainNode(this.globalVolumeNodeId);
        }

        if (this.masterOutputNode !== null) {
            const ctx = WorldModule.player.audioCtx;
            this.masterOutputNode.disconnect(ctx.destination);
        }

        if (this.audio !== null) {
            this.audio.pause();
            this.audio.srcObject = null;
            this.gainNode.gain.value = 0;
        }

        if (this.harkEvents !== null) {
            this.harkEvents.stop();
        }
    }

}