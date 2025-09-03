<template>
  <div>
    <SecsViewerHeader
      :code="headerCode"
      :theme="''"
      :edit="true"></SecsViewerHeader>
    <!-- <SecsViewerStatic></SecsViewerStatic> -->
    <SecsViewerBody
      :code="code"
      :theme="''"
      :default-expand="false"></SecsViewerBody>
    <!-- <SecsViewerCompareStatic></SecsViewerCompareStatic> -->
    <!-- <SecsViewerCompare
      :code="code"
      :compare-code="compareCode"></SecsViewerCompare> -->
  </div>
</template>
<script setup>
import { ref } from 'vue';
import {
  SecsViewerHeader,
  SecsViewerBody,
  // SecsViewerCompare,
} from '@/index.js';
const code = ref('');
const headerCode = ref('SEND D0 SSR_PPID_Scenario:S1F3 W [4026531841]\n');
const compareCode = ref('');

// code.value = `
// <L 5
//   <A [4] MDLN 'WXXX'>
//   <A [6] SOFTREV 'VO1R01'>
//   <L 2
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//         <L 2
//         <A [4] MDLN 'WXXX'>
//         <A [6] SOFTREV 'VO1R01'>
//   <L 3
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <A [6] SOFTREV 'VO1R01'>
//   <L 2
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <L 2 <A [4] MDLN 'WXXX'>
//         <A [6] SOFTREV 'VO1R01'>
//   `;

const message = ref(
  // "RECD D0 ConnectHost:S1F13 W [2060752742]\n                    <L 2\n                        <A [5] MDLN 'IConn'>\n                        <A [7] SOFTREV '888462A'>\n",

  // "RECD D0 OperModeChg:S6F11 [2746259558]\n                    <L 3\n                        <U2 [1] DATAID '0'>\n                        <U2 [1] CEID '8020'>\n                        <L 3 RPTIDCOUNT\n                            <L 2\n                                <U2 [1] RPTID0 '2'>\n                                <L 3 VCOUNT0\n                                    <U1 [1] V00 '3'>\n                                    <U1 [1] V01 '1'>\n                                    <A [0] V02 ''>\n                            <L 2\n                                <U2 [1] RPTID1 '4'>\n                                <L 2 VCOUNT1\n                                    <U1 [1] V10 '6'>\n                                    <A [11] V11 'ReteachPads'>\n                            <L 2\n                                <U2 [1] RPTID2 '12'>\n                                <L 1 VCOUNT2\n                                    <I2 [1] V20 '0'>\n",
  "SEND D0 SSR_PPID_Scenario:S1F3 W [4026531841]\n                    <L 3 SVCOUNT\n                        <U2 [1] ProcessState '3007'>\n                        <U2 [1] PPExecName '3004'>\n                        <U2 [1] EquipmentMode '3030'>\n",
);

const msg = message.value.split('\n');
msg.shift();
console.log(msg);

code.value = msg.join('\n');

compareCode.value = `
<L 4
  <A [4] MDLN 'WXXX'>
  <A [6] SOFTREV 'VO1R01'>
  <L 1
    <A [6] SOFTREV 'VO1R01'>
  <L 3
    <A [6] SOFTREV 'VO1R01'>
    <L 2
      <A [4] MDLN 'WXXX'>
      <A [6] SOFTREV 'VO1R01'>
    <A [6] SOFTREV 'VO1R02'>
  `;

// compareCode.value = `
// <L 5
//   <A [4] MDLN 'WXXX123'>
//   <A [6] SOFTREV 'VO1R01'>
//   <L 2
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//         <L 2
//         <A [4] MDLN 'WXXX'>
//         <A [6] SOFTREV 'VO1R01'>
//   <L 3
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [6] SOFTREV 'VO1R01'>
//       <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <A [6] SOFTREV 'VO1R01'>
//   <L 2
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <L 2 <A [4] MDLN 'WXXX'>
//         <A [6] SOFTREV 'VO1R01'>
//   `;
</script>
