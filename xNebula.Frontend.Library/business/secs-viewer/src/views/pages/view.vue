<template>
  <div>
    <SecsViewerHeader :code="headerCode" :theme="theme"></SecsViewerHeader>
    <SecsViewerBody
      :code="bodyCode"
      :theme="theme"
      :default-expand="true"></SecsViewerBody>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { SecsViewerHeader, SecsViewerBody } from '@/index.js';
const theme = ref('light');
const bodyCode = ref('');
const headerCode = ref('');
const message = ref(
  // "D0 S2F31:S2F31 W [3758096387]\r\n                    <A [12] '240819110009'>\r\n",
  // "D0 S1F3:S1F3 W [3758096391]\r\n                    <L 3\r\n                        <U4 [1] '9'>\r\n                        <U4 [1] '11'>\r\n                        <U4 [1] '48'>\r\n",
  "D0 S2F37:S2F37 W [3758096394]\r\n                    <L 2\r\n                        <BOOLEAN [1] '1'>\r\n                        <L 0\r\n",
  // "SEND D0 SSR_PPID_Scenario:S1F3 W [4026531841]\n                    <L 3 SVCOUNT\n                        <U2 [1] ProcessState '3007'>\n                        <U2 [1] PPExecName '3004'>\n                        <U2 [1] EquipmentMode '3030'>\n",
);

const msg = message.value.split('\n');
headerCode.value = msg.shift();
bodyCode.value = msg.join('\n');
</script>
