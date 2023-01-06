import {createContext, useContext} from "react";
import React from "react";
import {OpenAudioMcReact} from "./OpenAudioMcReact";

export const OAC = createContext({});

export class OpenAudioAppContainer extends React.Component {

    constructor(props) {
        super(props);
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.set = this.set.bind(this);

        this.state = {
            // app instance
            app: new OpenAudioMcReact(),

            // state - null for the login screen
            currentUser: {
                'name': 'Toetje',
                'uuid': "2fb3a3e2-64ca-433d-8692-ff9d35bc6f92"
            },

            // click lock
            clickLock: true,

            // view states
            isLoading: false,
            loadingState: 'Preparing to load OpenAudioMc',
            set: this.set,

            lang: {
                'lang.name': 'English',
                'lang.detectedAs': 'We changed your language to %langName, do you want to keep it like this?',
                'lang.keep': 'Keep %langName',
                'lang.toEn': 'Switch to English',
                'ui.loading': 'Loading...',
                'ui.logout': 'Log out',
                'navbar.audio': 'Audio',
                'navbar.vc': 'VoiceChat',
                'navbar.settings': 'Settings',
                'navbar.free': 'free',
                'navbar.premium': 'premium',
                'home.activate': 'Activate session',
                'home.activateText': 'This is personal webpage will be used to play your audio and voice throughout your visit. Please click anywhere on this page to get started.',
                'home.clickAnywhere': 'Click anywhere to get started',
                'home.activateHeader': 'Click here to connect',
                'home.welcome': 'Welcome, %player!',
                'home.header': 'Welcome to our audio client! keep this page open to experience our in-game music and effects. You can get back here any time during your session to change your volume and settings.',
                'home.volumeContext': 'This slider controls the volume of in-game music and effects. You can also use <pre>/volume &lt;volume&gt;</pre> to change your volume from in game at any time, or just set it to 0 to mute it momentarily.',
                'home.audioControls': 'Audio controls',
                'home.notificationsTitle': 'Notifications',
                'home.notificationsEmpty': "You don't have any notifications at the moment",
                'vc.voiceModerationEnabled': 'This server has moderation enabled. Select staff may be listening in while your mic is active.',
                'vc.notice': 'Notice',
                'vc.startingPopupTitle': 'Logging into voice chat...',
                'vc.startingPopup': "Please wait while we get you setup with a voice server... hold on tight, this shouldn't take too long.",
                'vc.reloadingPopupTitle': 'Reloading voice system!',
                'vc.reloadingPopup': "Please wait while voice chat gets restarted to apply your new settings... This shouldn't take long",
                'vc.updatingMicPopupTitle': 'Updating microphone!',
                'vc.updatingMicPopup': "Please wait while voice chat gets restarted with your new microphone... This shouldn't take long",
                'vc.micErrorPopupTitle': 'Microphone error',
                'vc.micErrorPopup': 'Something went wrong while trying to access your microphone. Please press "allow" when your browser asks you for microphone permissions, or visit the wiki for more information.',
                'vc.disabled': 'VoiceChat has temporarily been disabled by %serverName',
                'vc.title': 'Proximity Voice Chat',
                'vc.boardingTitle': 'VoiceChat onboarding',
                'vc.onboarding': 'This server has support for Proximity Voice Chat, which allows you to talk with players within a %range block radius. Would you like to enable this feature and give access to your microphone?',
                'vc.settings': 'VoiceChat settings',
                'vc.input': 'Input Device',
                'vc.aboutInput': 'Select the microphone you want to use, changing this will cause your session to restart.',
                'vc.positionalAudio': 'Positional Audio',
                'vc.aboutPositionalAudio': 'Render a 360 degree soundscape, allowing positional awareness with voices.',
                'vc.settingsDisable': 'Disable',
                'vc.settingsEnablePositionalAudio': 'Enable Positional Audio',
                'vc.settingsDisablePositionalAudio': 'Disable Positional Audio',
                'vc.automaticAdjustments': 'Adjust automatically',
                'vc.sensitivity': 'Microphone Sensitivity',
                'vc.aboutSensitivity': 'Configure a noise gate, cutting out your background hiss and noise and only activating your microphone when speaking.',
                'vc.peerTable': 'People within voice range',
                'vc.toggleMicrophone': 'Toggle Microphone',
                'vc.you': 'you',
                'vc.safetyTitle': 'For your safety',
                'vc.safetyDisclaimer': "You'll receive in-game messages when people appear and leave your voice chat range, and you'll be able to view a list of people who you can hear (and can hear you in turn), and mute them if desired. OpenAudioMc relies on your server to handle moderation and handle reports of abuse when necessary. Please contact a member of staff if you have any questions or concerns.",
                'vc.safetyFooter': '<b>Want some privacy? you can mute your microphone at any time by running <pre style="display: inline;">/mm</pre> or holding <pre style="display: inline;">shift + F</pre> in game, or alternatively by pressing the button on this web page.</b>',
                'vc.join': 'Join Voice Chat',
                'vc.muteMicrophone': 'Mute',
                'vc.unmuteMicrophone': 'Unmute',
                'vc.myStatus': 'Your own microphone status',
                'vc.statusTitle': 'My status',
                'vc.settings.globalVolumeTitle': 'General VoiceChat volume',
                'vc.settings.globalVolumeAbout': 'Change the master volume of all your VoiceChat peers',
                'vc.settings.toggleMenuTitle': 'VoiceChat input settings',
                'vc.settings.toggleMenu': 'Toggle Menu',
                'vc.settings.monitoring.title': 'Microphone Monitoring',
                'vc.settings.monitoring.about': 'Monitoring plays your own voice back for yourself like how others hear you, useful to test your microphone and sensitivity settings.',
                'vc.settings.monitoring.toggle': 'Enable monitoring',
                'vc.settings.surround.enable': 'Enable Surround',
                'vc.settings.surround.disable': 'Disable Surround',
                'hue.hue': 'Philips Hue',
                'hue.link': 'Click here to connect to your hue bridge',
                'hue.preparing': 'Preparing setup...',
                'hue.loggingIn': 'Logging in...',
                'hue.linking': 'Press the link button on your hue bridge within %sec seconds to connect.',
                'hue.connectedTo': 'You are now connected with your Hue Bridge:',
                'hue.light1': 'Light one',
                'hue.light2': 'Light two',
                'hue.light3': 'Light three',
                'hue.connected': 'You may now link up to three lights that the server will control. Usually from right to left.',
                'hue.close': 'Close',
                'notification.success': "Hurray! you'll now receive notifications",
                'notification.test.title': 'Testing testing 123',
                'notification.test.body': 'It worked! you have configured Notifications correctly!',
                'notification.info.voicechat': '<div style="text-align: center;" class="medium-text">This server supports <b>Proximity Voice Chat</b>! go to the <b>VoiceChat</b> tab to hop in and talk to others.</div>',
                'notification.voicechat.peeradd.title': 'New voicechat peer',
                'notification.voicechat.peeradd.body': '%name apeared in your voice chat radius',
                'notification.voicechat.peerdop.title': 'Player left voicechat',
                'notification.voicechat.peerdop.body': '%name left your voice chat radius',
                'settings.voicechat.chimes.title': 'VoiceChat Chimes',
                'settings.voicechat.chimes.body': 'Chimes are the little sounds that play whenever you mute/unmute your microphone. Content creators may want to turn this off.',
                'settings.voicechat.chimes.button': 'use chimes',
                'settings.theme.title': 'Dark mode',
                'settings.theme.body': 'Use the (default) dark mode of this web client',
                'settings.theme.button': 'dark mode',
                'settings.voicechat.peer.title': 'Peer Notifications',
                'settings.voicechat.peer.body': 'Receive desktop notifications whenever someone enters or leaves your voice chat range',
                'settings.voicechat.peer.button': 'enable notifications',
                'settings.mix-and-fade.title': 'Automatic music mixing',
                'settings.mix-and-fade.body': 'Automatically cross-fade and mix audio sources',
                'settings.mix-and-fade.button': 'Enable mixing',
                'settings.preload.title': 'Automatically preload audio files',
                'settings.preload.body': 'With this enabled, OpenAudioMc will automatically preload files that are often used around your in-game location. This will make audio more responsive, but uses more data.',
                'settings.preload.button': 'Enable preloading',
                'settings.rolloff.title': '3D Audio Rolloff',
                'settings.rolloff.body': 'This controls the amount of dampening applied to 3D audio based on distance. The 0% is no dampening, the 100% is full dampening. This applies to both speakers and voice chat.',
                'settings.rolloff.01': '1% (minimal)',
                'settings.rolloff.5': '50%',
                'settings.rolloff.8': '80%',
                'settings.rolloff.1': '100% (normal)',
                'settings.rolloff.12': '120%',
                'settings.rolloff.15': '150% (extreme)',
                'settings.spatial.title': 'Spatial rendering engine',
                'settings.spatial.body': "Select what rendering engine you'd like to use. The modern engine is of higher quality and a bit faster, but is still in active development",
                'settings.spatial.modern': 'Accurate',
                'settings.spatial.legacy': 'Legacy (old system)',
                'settings.interpolation.title': 'Location smoothing',
                'settings.interpolation.body': 'Automatically smooth movements to minimize speaker/voicechat stuttering while walking. This adds extra movement delay, but sounds better.',
                'settings.interpolation.button': 'Enable smoothing',
                'settings.streamermode.title': 'Streamer Mode',
                'settings.streamermode.body': "Automatically disable your session tokens after single use. This means that your client URL's are safe to show on stream without worrying that a viewer impersonates you. Just be sure to open your link as soon as you get it.",
                'settings.streamermode.button': 'Enable streamer mode',
            }
        }

    }

    set(data) {
        this.setState(data);
    }

    handleGlobalClick() {
        if (this.state.clickLock) {
            this.setState({clickLock: false});
        }
    }

    render() {
        return (
            <div className={"h-full"} onClick={this.handleGlobalClick}>
                <OAC.Provider value={this.state}>
                    {this.props.children}
                </OAC.Provider>
            </div>
        );
    }

}

export function getTranslation(context, message) {
    return context.lang[message];
}