<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>
    <div v-else>
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:flex justify-between">
          <div class="mb-4 lg:mb-0">
            <div class="flex items-center">
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                Livestream
              </h1>
              <div @click="openTipsModal()">
                <InfoIcon class="mx-2 cursor-pointer"></InfoIcon>
              </div>
            </div>
            <span class="text-base leading-4 font-bold">
            {{ classObj.class_type.name }}, {{ dbDateToHumanDate(classObj.date) }}
            kl. {{ classObj.start_time.substr(0, 5) }}
          </span>
          </div>


          <div v-if="!channel">
            -- Offline --
          </div>

          <div class="time-information px-6 py-3 text-center leading-normal inline-flex text-lg md:text-3xl cursor-pointer leading-5 rounded-sm bg-gray-100 m-1">
            {{ timeInformationText }}
          </div>


          <div class="flex lg:justify-end items-end flex-wrap">

            <span
              v-if="showSwitchCameraButton"
              @click="switchCamera"
              class="px-6 py-3 inline-flex text-base cursor-pointer leading-5 rounded-sm bg-gray-300 m-1"
            >
              <CameraRotateIcon></CameraRotateIcon>
              <span class="mx-2 self-center font-bold">
                {{ $t('global.SwitchCamera') }}
              </span>
            </span>

            <span
              class="py-3 px-6 relative inline-flex text-base leading-5 rounded-sm livestream-not-connected m-1"
              :class="{ 'livestream-connected animate-pulse' : livestreamConnected }"
            >
            <CastIcon></CastIcon>
            <span class="mx-2 self-center font-bold">
              {{ connectionStateText }}
            </span>

          </span>

            <button
              class="btn-primary btn-big m-1"
              @click.prevent="startStreamingButtonClick()"
              v-if="showStartStreamingButton"
            >
              {{ $t('global.StartLiveStream') }}
            </button>
            <button
              class="btn-primary btn-big md-accent btn-online m-1"
              @click.prevent="stopStreamingButtonClick()"
              v-else-if="showStopStreamingButton"
            >
              {{ $t('global.StopLiveStream') }}
            </button>
          </div>
        </div>
      </header>

      <main class="-z-1">

        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">

            <div class="flex flex-col md:flex-row">
              <div
                class="w-full order-2 md:order-1 transition-width"
                :class="slimChat ? 'md:w-10' : 'md:w-3/12'"
              >
                <div
                  class="w-full flex items-center justify-between bg-white rounded cursor-pointer"
                  :class="slimChat ? 'p-4 md:p-2' : 'p-4'"
                  @click="toggleChat"
                >
                  <ChevronLeft
                    class="flex self-center order-2 md:order-1 transition-transform"
                    :class="slimChat ? 'transform -rotate-90 md:rotate-180' : 'transform rotate-90 md:rotate-0'"
                  >
                  </ChevronLeft>
                  <h3
                    class="text-lg lg:text-xl font-bold order-1 md:order-2"
                    :class="slimChat ? 'md:hidden' : ''"
                  >
                    {{ $t('global.Chat') }}
                  </h3>
                </div>
                <div :class="slimChat ? 'hidden' : 'w-full'" class="chat-height">
                  <!--
                  Hacks in CometChat UI:
                  - Sound disabled
                  - Polls button hidden
                  - Stickers button hidden
                  - User action messages hidden
                  - Emoji panel position adjusted, so it stays inside the screen

                  -->
                  <CometChatMessages
                    v-if="showChat"
                    class="h-80 w-full"
                    :logged-in-user="cometChatLoggedInUser"
                    :item="cometChatItem"
                    :group-messages="[]"
                    type="group"
                    :sidebar="false"
                  >
                  </CometChatMessages>
                </div>
              </div>
              <div
                class="preview-container w-full md:mx-4 block z-10 order-1 md:order-2"
                ref="previewContainer"
              >
              </div>

              <div
                class="w-full flex flex-col bg-white bg-white md:h-workspace overflow-scroll z-10 rounded order-3 transition-width"
                :class="slimParticipantList ? 'md:w-16 items-center p-4 md:p-2' : 'md:w-3/12 p-4'"
              >
                <div
                  class="w-full flex items-center mb-4 cursor-pointer"
                  :class="slimParticipantList ? 'justify-between md:justify-center' : 'justify-between'"
                  @click="toggleParticipantList"
                >
                  <h3
                    class="text-lg lg:text-xl font-bold"
                    :class="slimParticipantList ? 'md:hidden' : ''"
                  >
                    {{ $t('global.Participants') }}
                  </h3>
                  <ChevronRight
                    class="flex self-center transition-transform"
                    :class="slimParticipantList ? 'transform -rotate-90 md:rotate-180 transition-all' : 'transform -rotate-90 md:rotate-0 transition-all'"
                  >
                  </ChevronRight>
                </div>
                <div
                  class="participant relative self-start mb-1 w-full"
                  v-for="participant in participants"
                  :class="participant.connected_to_livestream ? 'connected-participant pulsate-fwd' : 'bg-fade rounded-full'"
                  :key="'participant_' + participant.id"
                >
                  <div class="flex items-center">
                    <img
                      alt=""
                      :src="profileImageSrc(participant.image)"
                      class="bg-white h-8 md:h-6 lg:h-8 w-8 md:w-6 lg:w-8 rounded-full border-white border-2"
                    >
                    <span
                      class="text-xs ml-2"
                      :class="slimParticipantList ? 'md:hidden' : ''"
                    >
                      {{ participant.first_name + ' ' + participant.last_name }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
    <!--<div v-if="user.email.match(/@yogo\.dk$/)">
      <h2>Video debugging (only visible to YOGO)</h2>
      <h3>mediaDevices</h3>
      {{ mediaDevices }}
      <h3>videoInputDevices</h3>
      {{ videoInputDevices }}
      <h3>currentVideoInputDeviceId</h3>
      {{ currentVideoInputDeviceId }}
      <h3>Supported constraints</h3>
      {{ supportedConstraints }}
    </div>-->

    <Modal v-show="errorModal" class="bg-red-500" @close="errorModal = false">
      <template v-slot:header>
        <div class="flex w-full justify-center h-20">
          <AlertTriangle size="icon-big"></AlertTriangle>
        </div>
        <h3 class="text-center mt-8">
          {{ $t('global.ConnectionError') }}
        </h3>
      </template>
      <template v-slot:body>
        <div class="text-center">
          {{ $t('global.ConnectionErrorDescription') }}
        </div>
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="errorModal = false"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

    <Modal v-show="tipsModal" @close="tipsModal = false">
      <template v-slot:header>
        <h3 class="mb-5">
          {{ $t('global.LivestreamTipsTitle') }}
        </h3>
      </template>
      <template v-slot:body>
        {{ $t('global.LivestreamTipsInfo') }}
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="tipsModal = false"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

  </div>
</template>

<script>

/* global _ */

import moment from 'moment-timezone';

import fmLiveswitch from 'fm.liveswitch';
import { mapGetters } from 'vuex';
import YogoApi from '@/gateways/YogoApi';
import LoadingAnimation from './LoadingAnimation.vue';
import dateTimeFunctions from '../mixins/dateTimeFunctions.vue';
import avatar from '../graphics/avatar';
import InfoIcon from '../graphics/icons/InfoIcon.vue';
import Modal from './Modal.vue';

import Imgix from '../services/Imgix';
import CameraRotateIcon from '../graphics/icons/CameraRotateIcon.vue';
import CastIcon from '../graphics/icons/CastIcon.vue';
import ChevronRight from '../graphics/icons/ChevronRight.vue';
import ChevronLeft from '../graphics/icons/ChevronLeft.vue';
import AlertTriangle from '../graphics/icons/AlertTriangle.vue';

import { CometChat } from '@cometchat-pro/chat';
import { CometChatMessages } from '../cometchat-pro-vue-chat-ui-kit';


const connectionStateStrings = [
  'global.NotConnected',
  'global.Connecting', // new
  'global.Connecting', // initializing
  'global.Connecting', // Connecting
  'global.ONLINE', // Connected
  'global.ConnectionError', // Failing
  'global.ConnectionError', // Failed
  'global.Closing', // Closing
  'global.NotConnected', // Closed
];

export default {
  name: 'LivestreamClass',
  components: {
    CastIcon,
    CameraRotateIcon,
    LoadingAnimation,
    InfoIcon,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    Modal,
    CometChatMessages,
  },
  mixins: [dateTimeFunctions, Imgix],
  data() {
    return {
      loading: true,
      classObj: null,
      tipsModal: false,
      errorModal: false,
      slimParticipantList: false,
      slimChat: false,

      livestreamRequested: false,
      reconnectTimeout: null,

      mediaDevices: [],
      currentVideoInputDeviceId: null,
      cameraFacingMode: 'environment',

      layoutManager: null,

      liveswitchRegisterClientToken: '',
      liveswitchClient: null,
      channel: null,
      localMedia: null,
      audioStream: null,
      videoStream: null,
      mediaStream: null,
      connection: null,
      connectionState: 0,

      participants: [],

      pollRemoteClientsInterval: null,
      remoteClientInfos: [],

      notifyViewersOfLivestreamRunningInterval: null,

      moment,

      supportedConstraints: navigator.mediaDevices.getSupportedConstraints(),

      // CometChat
      showChat: false,
      cometChatLoggedInUser: null,
      cometChatItem: null,

      timeInformationText: '',
      timeInformationUpdateInterval: null,
    };
  },
  computed: {
    ...mapGetters([
      'liveswitchDeviceId',
      'user',
    ]),
    videoInputDevices() {
      return _.filter(this.mediaDevices, { kind: 'videoinput' });
    },
    connectionStateText() {
      return this.$t(connectionStateStrings[this.connectionState]);
    },
    livestreamConnected() {
      return _.includes(
        [
          fmLiveswitch.ConnectionState.Connecting,
          fmLiveswitch.ConnectionState.Connected,
        ],
        this.connectionState,
      );
    },
    showSwitchCameraButton() {
      return this.videoInputDevices.length > 1 && !this.connection;
    },
    showStartStreamingButton() {
      return !this.livestreamRequested;
    },
    showStopStreamingButton() {
      return this.livestreamRequested;
    },
    avatar() {
      return avatar;
    },

  },

  created() {
    this.currentVideoInputDeviceId = this.$route.name === 'LivestreamClassWithDeviceId'
      ? this.$route.params.deviceId
      : (
        fmLiveswitch.Util.isiOS() || fmLiveswitch.Util.isAndroid()
          ? 'environment'
          : null
      );
  },

  async mounted() {
    this.initLiveswitch();
    this.initCometChat();
    this.notifyViewersOfLivestreamRunningInterval = setInterval(
      this.notifyViewersOfLivestreamRunning,
      4000,
    );
    this.timeInformationUpdateInterval = setInterval(
      this.updateTimeInformationText,
      1000,
    );
  },

  methods: {

    toggleChat() {
      this.slimChat = !this.slimChat;
      console.log('participant list click');
    },

    toggleParticipantList() {
      this.slimParticipantList = !this.slimParticipantList;
      console.log('participant list click');
    },

    async initCometChat() {
      const {
        authToken,
        appId: cometChatAppId,
        region: cometChatRegion,
      } = await YogoApi.post(
        '/integrations/cometchat/init-class-livestream-chat',
        { class: this.$route.params.classId },
      );
      const appSetting = new CometChat.AppSettingsBuilder()
        .subscribePresenceForAllUsers()
        .setRegion(cometChatRegion)
        .build();

      CometChat.init(cometChatAppId, appSetting).then(
        () => {
          console.log('CometChat Initialization completed successfully');
          CometChat.login(authToken).then(
            (user) => {
              console.log('CometChat Login Successful:', { user });
              this.cometChatLoggedInUser = user;
              CometChat.getGroup(`class-${this.$route.params.classId}`).then(
                (group) => {
                  console.log('Group details fetched successfully:', group);
                  this.cometChatItem = group;
                  this.showChat = true;
                },
                (error) => {
                  console.log('Group details fetching failed with exception:', error);
                },
              );
            },
            (error) => {
              console.log('CometChat Login failed with exception:', { error });
            },
          );
          // You can now call login function.
        },
        (error) => {
          console.log('Initialization failed with error:', error);
          // Check the reason for error and take appropriate action.
        },
      );
    },

    openTipsModal() {
      this.tipsModal = true;
    },

    async initLiveswitch() {
      fmLiveswitch.Log.registerProvider(
        new fmLiveswitch.ConsoleLogProvider(fmLiveswitch.LogLevel.Info),
      );

      const { classId } = this.$route.params;

      const [
        classItem,
        { gatewayURL, applicationId },
      ] = await Promise.all([
        YogoApi.get(`/classes/${classId}?populate[]=class_type`),
        YogoApi.get('/livestream/liveswitch-info'),
      ]);

      this.classObj = classItem;

      this.liveswitchClient = new fmLiveswitch.Client(
        gatewayURL,
        applicationId,
        `user-${this.user.id}`,
        this.liveswitchDeviceId,
      );


      await this.registerWithChannel();

      await this.getLocalMedia();

      if (!this.pollRemoteClientsInterval) {
        await this.pollParticipants();
        this.pollRemoteClientsInterval = setInterval(this.pollParticipants, 10000);
      }
    },

    async registerWithChannel() {
      const { token } = await YogoApi.post('/livestream/get-register-client-for-class-auth-token', {
        classId: this.classObj.id,
        deviceId: this.liveswitchDeviceId,
        clientId: this.liveswitchClient.getId(),
      });

      this.liveswitchRegisterClientToken = token;

      try {
        if (this.channel) {
          await this.channel.closeAll();
          this.channel.leave();
        }
        [this.channel] = (await this.liveswitchClient.register(this.liveswitchRegisterClientToken));
        // console.log(`connected to channel: ${this.channel.getId()}`);
      } catch (e) {
        throw new Error('registration failed');
      }
    },

    async getLocalMedia() {
      if (this.localMedia) {
        try {
          await this.localMedia.stop();
          this.localMedia.destroy();
        } catch (e) {
          alert('Could not destroy local media.');
          console.log('Could not destroy localMedia');
        }
      }

      const videoTrackConstraints = {
        width: 1280,
        height: 720,
      };

      if (this.currentVideoInputDeviceId) {
        if (this.currentVideoInputDeviceId === 'environment' || this.currentVideoInputDeviceId === 'user') {
          videoTrackConstraints.facingMode = this.currentVideoInputDeviceId;
        } else {
          videoTrackConstraints.deviceId = this.currentVideoInputDeviceId;
        }
      }

      // alert(`videoTrackConstraints: ${JSON.stringify(videoTrackConstraints)}`);

      try {
        this.localMedia = new fmLiveswitch.LocalMedia(true, videoTrackConstraints);

        await this.localMedia.start();
        console.log('media capture started');
      } catch (e) {
        alert('Could not access the camera. Please reload the page and try again.');
        console.log(e.message);
      }

      this.loading = false;

      try {
        // Placing device info code after initializing localMedia,
        // because iOS only discloses the camera info
        // after user has given access to the camera
        this.mediaDevices = await navigator.mediaDevices.enumerateDevices();
      } catch (err) {
        console.error(err);
        alert('Could not enumrate video devices. Please reload the page to try again.');
      }
      console.log('this.mediaDevices:', this.mediaDevices);
      if (!_.find(this.mediaDevices, { kind: 'videoinput' })) {
        alert('No available cameras');
        throw new Error('No available cameras');
      }
      // console.log('this.currentVideoInputDeviceId:', this.currentVideoInputDeviceId);
      if (!this.currentVideoInputDeviceId) {
        this.currentVideoInputDeviceId = this.videoInputDevices[0].deviceId;
      }
      // console.log('this.currentVideoInputDeviceId:', this.currentVideoInputDeviceId);


      if (!this.layoutManager) {
        this.layoutManager = new fmLiveswitch.DomLayoutManager(this.$refs.previewContainer);
      }
      this.layoutManager.setLocalView(this.localMedia.getView());
    },

    async switchCamera() {
      let newVideoInputDeviceId;

      if (this.currentVideoInputDeviceId === 'environment') {
        newVideoInputDeviceId = 'user';
      } else if (this.currentVideoInputDeviceId === 'user') {
        newVideoInputDeviceId = 'environment';
      } else {
        const currentVideoDeviceIdx = _.findIndex(this.videoInputDevices,
          { deviceId: this.currentVideoInputDeviceId });

        // console.log('currentVideoDeviceIdx:', currentVideoDeviceIdx);

        let newVideoInputDevice;
        if (this.videoInputDevices.length === currentVideoDeviceIdx + 1) {
          [newVideoInputDevice] = this.videoInputDevices;
        } else {
          newVideoInputDevice = this.videoInputDevices[currentVideoDeviceIdx + 1];
        }
        // console.log('newVideoInputDevice:', newVideoInputDevice);
        // alert(`newVideoInputDevice ${JSON.stringify(newVideoInputDevice)}`);
        newVideoInputDeviceId = newVideoInputDevice.deviceId;
      }
      // alert(`newVideoInputDeviceId: ${newVideoInputDeviceId}`);

      this.currentVideoInputDeviceId = newVideoInputDeviceId;
      this.getLocalMedia();
    },

    startStreamingButtonClick() {
      // console.log('startStreamingButtonClick()');
      this.livestreamRequested = true;
      if (!this.connection || _.includes(
        [
          fmLiveswitch.ConnectionState.Failed,
          fmLiveswitch.ConnectionState.Closed,
          fmLiveswitch.ConnectionState.New,
        ],
        this.connectionState,
      )) {
        this.startStreaming();
      }
    },

    stopStreamingButtonClick() {
      // console.log('stopStreamingButtonClick()');
      this.livestreamRequested = false;
      if (this.connection && _.includes(
        [
          fmLiveswitch.ConnectionState.Connecting,
          fmLiveswitch.ConnectionState.Connected,
        ],
        this.connectionState,
      )) {
        this.stopStreaming();
      }
    },

    connectionStateChange(connection) {
      // console.log('connection state change: ', connection.getId(), connection.getState());

      if (connection.getId() !== this.connection.getId()) {
        if (_.includes(
          [
            fmLiveswitch.ConnectionState.Connected,
            fmLiveswitch.ConnectionState.Connecting,
          ],
          connection.getState(),
        )) {
          // console.log('Old connection about to connect. Closing it. ', connection.getId());
          connection.close();
        }
        // console.log('Old connection statechange. Returning. ', connection.getId());
        return;
      }

      this.connectionState = connection.getState();

      if (_.includes(
        [
          fmLiveswitch.ConnectionState.Connected,
        ],
        connection.getState(),
      )) {
        this.errorModal = false;
      }

      if (this.livestreamRequested && _.includes(
        [
          fmLiveswitch.ConnectionState.Failed,
        ],
        this.connectionState,
      )) {
        console.log('Restarting connection because connection failed');
        this.errorModal = true;
        this.startStreaming();
      }

      if (!this.livestreamRequested && _.includes(
        [
          fmLiveswitch.ConnectionState.Connecting,
          fmLiveswitch.ConnectionState.Connected,
        ],
        this.connectionState,
      )) {
        console.log('Connection connecting or ready, but not requested. Closing connection.');
        connection.close();
      }
    },

    async tryConnectingAgainInAMoment() {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      if (this.livestreamRequested) {
        this.reconnectTimeout = setTimeout(this.startStreaming, 4000);
      }
    },

    async startStreaming() {
      console.log('startStreaming()');
      if (!this.livestreamRequested) return;

      if (!this.audioStream) {
        this.audioStream = new fmLiveswitch.AudioStream(this.localMedia, null);
      }
      if (!this.videoStream) {
        this.videoStream = new fmLiveswitch.VideoStream(this.localMedia, null);
      }


      // console.log('this.liveswitchClient.getState():', this.liveswitchClient.getState());
      if (this.liveswitchClient.getState() !== fmLiveswitch.ClientState.Registered) {
        try {
          console.log('Registering with channel');
          await this.registerWithChannel();
        } catch (e) {
          this.tryConnectingAgainInAMoment();
          return;
        }
      }

      if (this.connection && _.includes(
        [
          fmLiveswitch.ConnectionState.Connecting,
          fmLiveswitch.ConnectionState.Connected,
        ],
        this.connection.getState(),
      )) {
        console.log('Connection already connecting or connected. Returning.');
        return;
      }

      try {
        console.log('Creating connection');
        this.connection = this.channel.createSfuUpstreamConnection(
          this.audioStream,
          this.videoStream,
          `class-${this.$route.params.classId}`,
        );
      } catch (e) {
        console.log('An error occurred while creating SFU Upstream connection');
        this.tryConnectingAgainInAMoment();
        return;
      }

      this.connection.addOnStateChange(this.connectionStateChange);

      try {
        console.log('Opening connection:',
          this.connection ? this.connection.getId() : this.connection);
        await this.connection.open();
        this.notifyViewersOfLivestreamRunning();
        console.log('Connection established:',
          this.connection ? this.connection.getId() : this.connection);
      } catch (e) {
        console.log(e);
        console.log('An error occurred while establishing connection');
        this.tryConnectingAgainInAMoment();
      }
    },

    async stopStreaming() {
      console.log('stopStreaming()');
      if (!this.connection) return;
      await this.connection.close();
    },


    async pollParticipants() {
      if (this.channel && this.channel.getRemoteClientInfos) {
        const [classItem, remoteClientInfos] = await Promise.all([
          YogoApi.get(`/classes?id=${this.$route.params.classId}&populate[]=livestream_signups.user.image`),
          this.channel.getRemoteClientInfos(),
        ]);

        const remoteClientUserIds = _.chain(remoteClientInfos)
          .filter(remoteClient => remoteClient.getRoles()[0] === 'customer')
          .map(remoteClient => parseInt(remoteClient.getUserId().substr(5), 10))
          .value();

        this.remoteClientInfos = remoteClientInfos; // For debugging

        let participants = _.map(classItem.classes[0].livestream_signups, 'user');
        _.each(
          participants,
          (participant) => {
            participant.connected_to_livestream = _.includes(remoteClientUserIds, participant.id);
          },
        );
        participants = _.sortBy(participants, ['first_name', 'last_name']);

        this.participants = participants;
      } else {
        console.log('pollParticipants: No channel available.');
      }
    },

    async notifyViewersOfLivestreamRunning() {
      if (
        this.connection
        && this.channel
        && this.channel.sendMessage
        && this.connectionState === fmLiveswitch.ConnectionState.Connected
      ) {
        await this.channel.sendMessage('LIVESTREAM_RUNNING');
      }
    },

    secondsToHoursMinutesSeconds(seconds) {
      const displayHours = Math.floor(seconds / 3600);
      const displayMinutes = Math.floor((seconds - displayHours * 3600) / 60);
      const displaySeconds = seconds - displayHours * 3600 - displayMinutes * 60;
      return [
        _.padStart(displayHours, 2, '0'),
        ':',
        _.padStart(displayMinutes, 2, '0'),
        ':',
        _.padStart(displaySeconds, 2, '0'),
      ].join('');
    },

    updateTimeInformationText() {
      if (!this.classObj) return;
      const displayModeWhileRunning = this.user.livestream_time_display_mode || 'remaining';
      const classStartString = `${this.classObj.date} ${this.classObj.start_time}`;
      const classStartTimestamp = moment
        .tz(classStartString, 'Europe/Copenhagen')
        .format('X');
      const classEndString = `${this.classObj.date} ${this.classObj.end_time}`;
      const classEnd = moment.tz(classEndString, 'Europe/Copenhagen');
      const classPassesMidnight = this.classObj.start_time > this.classObj.end_time;
      if (classPassesMidnight) {
        classEnd.add(1, 'day');
      }
      const classEndTimestamp = classEnd.format('X');
      const now = moment().format('X');
      if (now < classStartTimestamp) {
        const secondsBeforeClassStarts = classStartTimestamp - now;
        this.timeInformationText = this.$t(
          'global.ClassStartsInX',
          { time: this.secondsToHoursMinutesSeconds(secondsBeforeClassStarts) },
        );
        return;
      }
      if (now < classEndTimestamp) {
        if (displayModeWhileRunning === 'elapsed') {
          const classHasBeenRunningForSeconds = now - classStartTimestamp;
          this.timeInformationText = this.$t(
            'global.ClassHasBeenRunningForX',
            { time: this.secondsToHoursMinutesSeconds(classHasBeenRunningForSeconds) },
          );
          return;
        }
        const classHasSecondsLeft = classEndTimestamp - now;
        this.timeInformationText = this.$t(
          'global.ClassEndsInX',
          { time: this.secondsToHoursMinutesSeconds(classHasSecondsLeft) },
        );
        return;
      }
      if (this.connectionState === fmLiveswitch.ConnectionState.Connected) {
        const classEndedSecondsAgo = now - classEndTimestamp;
        this.timeInformationText = this.$t(
          'global.ClassEndedXAgo',
          { time: this.secondsToHoursMinutesSeconds(classEndedSecondsAgo) },
        );
      } else {
        this.timeInformationText = this.$t('global.ClassHasEnded');
      }
    },

    switchTimeDisplayMode() {

    },
  },

  async beforeDestroy() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.pollRemoteClientsInterval) {
      clearInterval(this.pollRemoteClientsInterval);
    }
    if (this.notifyViewersOfLivestreamRunningInterval) {
      clearInterval(this.notifyViewersOfLivestreamRunningInterval);
    }
    if (this.connection) {
      this.connection.removeOnStateChange(this.connectionStateChange);
    }
    if (this.localMedia && this.localMedia.stop) {
      console.log('Stopping localMedia');
      await this.localMedia.stop();
    }
    if (this.channel) {
      console.log('Closing and leaving channel');
      await this.channel.closeAll();
      await this.channel.leave();
    }
    if (this.liveswitchClient) {
      console.log('Unregistering client');
      await this.liveswitchClient.unregister();
    }
  },
};


</script>

<style lang="scss" scoped>

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
}


.sidebar-slim {
  transition: 0.3s ease width;
  width: 64px !important;
}

.transition-transform {
  transition: 0.3s ease transform;
}

.transition-width {
  transition: 0.3s ease width;
}

.preview-container {
  width: 100%;
  height: 500px;
  background: black;
  border-radius: 0.25rem;
  @media (min-width: 768px) {
    height: 35rem;
  }
}

.chat-height {
  height: 20rem;
  @media (min-width: 768px) {
    height: 30.6rem;
  }
}

.connected-icon i {
  font-size: 140px !important;
  width: 140px;
  height: 140px;
}

.connected-icon.connected {
  color: green !important;
}

.connection-state-text {
  color: #ccc;

  &.connected {
    color: green;
  }
}

.livestream-not-connected {
  @apply bg-red-200 text-red-900;
}

.livestream-connected {
  @apply bg-green-200 text-green-900;
}

.participants {
  border: 1px solid #ccc;
}

.connected-participant {
  @apply bg-green-400;
  @apply text-white;
  @apply font-bold;
  width: 100%;
  @apply rounded-full;
}

.connected-participant:after {
  position: absolute;
  content: '';
  top: 0;
  left: 1px;
  @apply bg-green-600;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid theme('colors.white');
}

.checkbox > input:checked + span::before {
  left: 11px;
}

.icon-big {
  width: 80px;
  height: 80px;
}

.pulsate-fwd {
  -webkit-animation: pulsate-fwd 0.5s ease-in-out both 4;
  animation: pulsate-fwd 0.5s ease-in-out both 4;
  /*animation-iteration-count: 2;*/
}

@-webkit-keyframes pulsate-fwd {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

@keyframes pulsate-fwd {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}

.bg-fade {
  -webkit-animation: bg-fade .3s linear alternate both;
  animation: bg-fade .3s linear alternate both;
}

@-webkit-keyframes bg-fade {
  0% {
    @apply bg-green-400;
  }
  100% {
    background: transparent;
  }
}

@keyframes bg-fade {
  0% {
    @apply bg-green-400;
  }
  100% {
    background: transparent;
  }
}


</style>

<style lang="scss">

.cometchat__main__chat {
  z-index: 20;
  .cometchat_chat_option {
    display: none !important;
  }

  @media (min-width: 468px) {
    .emoji-mart {
      left: 120px !important;
    }
  }

  div[title="Stickers"] {
    display: none;
  }

  span[title="Create Poll"] {
    display: none;
  }

  .message__actions {
    display: none !important;
  }

}

</style>
