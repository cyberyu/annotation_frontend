<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div class=" col-2">
        <div v-for="(label,i) in Object.keys(labels)" :key="i" class="col-12" @click="annotate(label)">
          {{label}}
        </div>
      </div>
      <div class="col-10">
        <div class="row justify-center col-12">
          <q-btn color="primary" label="Get Data" class="justify-center" @click="fetchDocs()"/>
        </div>
          <div v-if="tokens" class="select-box">
            <div v-for="(token,i) in tokens" :key="i" :id="`t-${i}`"
                  class="column inline">
              <span class="q-px-xs" :class="getTokenClass(i)"
                    v-on:mousedown="selectStart(i);mousePressed=true"
                    v-on:mouseup="selectEnd(i);mousePressed=false"
                    v-on:mouseover="mousePressed && select(i)">
                {{token}}
              </span>
              <span v-if="detailedAnnotations[i] && detailedAnnotations[i][0]==='B'">
                <span v-for="(label,j) in detailedAnnotations[i][1]" :key="`label${j}`" class="label">
                  <q-icon name="clear" @click="removeAnnotation(i, label)"/> {{label}} <br>
                </span>
              </span>
            </div>
          </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      documents: [],
      document: null,
      tokens: null,
      start: null,
      end: null,
      labels: {
        'label A': 'red',
        'label B': 'blue',
        'label C': 'green'
      },
      annotations: [
        [11, 15, ['label A']],
        [26, 26, ['label B', 'label C']]
      ],
      detailedAnnotations: [],
      // each element is in the format of [ type, [labels]] where type is B or I
      selected: [],
      mousePressed: false
    }
  },
  mounted () {
  },
  methods: {
    selectStart (i) {
      // if the token is already annotated
      for (let k = 0; k < this.annotations.length; k++) {
        const start = this.annotations[k][0]
        const end = this.annotations[k][1]
        if (i <= end && i >= start) {
          this.start = start
          this.end = end
          this.selected = [...Array(end - start + 1).keys()].map(i => i + start)
          return 0
        }
      }
      // if not annotated, then it will be the start
      this.start = i
      this.selected = [i]
    },
    selectEnd (i) {
      this.end = i
      if (this.end < this.start) {
        this.end = this.start
        this.start = i
      }
    },
    select (i) {
      this.selected.includes(i) ? this.selected.pop() : this.selected.push(i)
    },
    getTokenClass (i) {
      let cls
      cls = this.detailedAnnotations[i] ? this.detailedAnnotations[i][0] : ''
      cls += this.selected.includes(i) ? ' selected' : ''
      return cls
    },
    annotate (label) {
      for (let k = 0; k < this.annotations.length; k++) {
        if (this.annotations[k][0] === this.start) {
          if (!this.annotations[k][2].includes(label)) {
            this.annotations[k][2].push(label)
            return 0
          }
        }
      }
      const annotation = [this.start, this.end, [label]]
      this.annotations.push(annotation)
      this.getDetailedAnnotations()
    },
    removeAnnotation (i, label) {
      for (let k = 0; k < this.annotations.length; k++) {
        if (this.annotations[k][0] === i) {
          const idx = this.annotations[k][2].indexOf(label)
          console.log('find label', idx)
          this.annotations[k][2].splice(idx, 1)
          if (this.annotations[k][2].length === 0) {
            this.annotations.splice(k, 1)
          }
        }
      }
      this.getDetailedAnnotations()
    },
    sortAnnotations () {
      // sort annotations by word index position
    },
    getDetailedAnnotations () {
      // convert annotations into detailed token based format
      this.detailedAnnotations = new Array(this.tokens.length)
      this.annotations.map(a => {
        const start = a[0]
        const end = a[1]
        const labels = a[2]
        for (let i = start; i <= end; i++) {
          if (i === start) {
            this.detailedAnnotations[i] = ['B', labels]
          } else {
            this.detailedAnnotations[i] = ['I', labels]
          }
        }
        return 0
      })
    },
    compressAnnotations () {
      // convert detailed annotations into compressed (index-based) format
    },
    fetchDocs () {
      this.$axios.get(this.$hostname + '/documents/').then(response => {
        console.log('use host', this.$hostname)
        this.documents = response.data.results
        this.document = this.documents[0]
        this.tokens = this.document.text.split(' ')
        this.getDetailedAnnotations()
      })
    },
    getSelection (obj) {
      /**
       * get a selection in the format of {fixStr, allStr, start, end}
       **/
      console.log(obj)
      this.highlight(this.documents[0].text, obj.start, obj.end)
    },
    highlight (text, start, end) {
      this.text = `${text.substring(0, start)}<span style="background-color: red">${text.substring(start, end)}</span>${text.substring(end)}`
    }
  }
}
</script>
<style>
.B, .I {
  text-decoration: underline red;
  text-decoration-style: wavy;
}
.label {
  position: relative;
}
.selected {
  border-bottom: #0d950d solid 1px;
}
/*.selected:first-of-type {*/
/*  border-left: #0d950d solid 1px;*/
/*}*/
/*.selected:last-child {*/
/*  border-right: #0d950d solid 1px;*/
/*}*/

::selection {
    background: none;
}
</style>
