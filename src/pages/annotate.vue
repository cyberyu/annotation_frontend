<template>
  <q-page class="flex">
    <div class="row self-start">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el label="Annotate" icon="navigation" />
      </q-breadcrumbs>
    </div>
    <div class="row self-start">
      <!--      <div class=" col-2">-->
      <!--        <div v-for="(label,i) in labels" :key="i" class="col-12" @click="annotate(label)">-->
      <!--          {{label.name}}-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="col-2"></div>
      <div class="col-8">
        <div v-if="tokens" class="select-box" @keyup="key" tabindex="0" @focusout="selected=[]">
          <div v-for="(token,i) in tokens" :key="i" :id="`t-${i}`" class="column inline">
            <span class="q-px-xs q-pt-xs token" :class="getTokenClass(i)"
                  v-on:mousedown="selectStart(i);mousePressed=true"
                  v-on:mouseup="selectEnd(i);mousePressed=false"
                  v-on:mouseover="mousePressed && select(i)">
              {{ token }}
            </span>
            <q-card v-if="selected[0]===i" class="label-window q-px-md q-py-sm" bordered>
              <div v-for="(label,k) in labels" :key="k" class="col-12" :style="`color:${label.color}`">
                <div v-if="detailedAnnotations[i] && detailedAnnotations[i][1].includes(label.id)"
                     @click="removeAnnotation(i, label.id)">
                  <q-icon name="check_circle"></q-icon>
                  {{ label.name }}
                </div>
                <div v-else @click="annotate(label)">
                  <q-icon name="radio_button_unchecked"></q-icon>
                  {{ label.name }}
                </div>
              </div>
            </q-card>
            <span v-if="!(selected[0]===i && mousePressed==false) && detailedAnnotations[i] && detailedAnnotations[i][0]==='B'">
              <span v-for="(label,j) in detailedAnnotations[i][1]" :key="`label${j}`" class="label" :style="`color:${labels[label].color}`">
                <q-icon name="check_circle" @click="removeAnnotation(i, label)"/> {{ labels[label].name }} <br>
              </span>
            </span>
          </div>
        </div>
        <div class="row justify-center col-12 q-mt-md">
          <q-btn color="primary" label="Previous" :disable="!prevURL" class="justify-center" @click="fetchDocs(prevURL)"/>
          <q-btn color="primary" label="Submit and Next" class="justify-center q-ml-md" @click="saveAnnotations(); nextURL? fetchDocs(nextURL): $router.push('/')"/>
        </div>
      </div>
      <div class="col-2 summary">
        <q-scroll-area style="height: 100%" v-if="tokens">
          <div v-for="(label, i) in Object.entries(categorizedAnnotations)" :key="i" class="summary-block">
            <div class="summary-label" ><span :style="`color: ${lLabels[label[0]].color}`">{{label[0]}}</span> ({{label[1].length}})</div>
            <ul class="summary-word">
              <li v-for="(w, j) in label[1]" :key="j">
                {{w.index}} - {{w.word}}
              </li>
            </ul>
          </div>
        </q-scroll-area>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Annotate',
  props: ['project'],
  data () {
    return {
      documents: [],
      document: null,
      tokens: null,
      start: null,
      end: null,
      labels: {},
      // labels: {
      //   2: { name: 'label A', color: 'red', id: 2 },
      //   3: { name: 'label B', color: 'green', id: 3 },
      //   5: { name: 'label C', color: 'blue', id: 5 }
      // },
      annotations: [],
      // annotations: [
      //   [11, 15, [2]],
      //   [27, 27, [5, 3]]
      // ],
      detailedAnnotations: [],
      // each element is in the format of [ type, [labels]] where type is B or I
      selected: [],
      mousePressed: false,
      nextURL: null,
      prevURL: null
    }
  },
  mounted () {
    this.fetchDocs()
    this.fetchLabels()
  },
  methods: {
    fetchLabels () {
      const url = this.$hostname + '/labels/'
      this.$axios.get(url).then(response => {
        response.data.forEach(a => {
          this.labels[a.id] = a
        })
      })
    },
    selectStart (i) {
      // if the token is already annotated
      // for (let k = 0; k < this.annotations.length; k++) {
      //   const start = this.annotations[k][0]
      //   const end = this.annotations[k][1]
      //   if (i <= end && i >= start) {
      //     this.start = start
      //     this.end = end
      //     this.selected = [...Array(end - start + 1).keys()].map(i => i + start)
      //     return 0
      //   }
      // }
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
      const min = Math.min(i, this.start)
      const max = Math.max(i, this.start)
      this.selected = [...Array(max - min + 1).keys()].map(k => k + min)
      // this.selected.includes(i) ? this.selected.pop() : this.selected.push(i)
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
          if (!this.annotations[k][2].includes(label.id)) {
            this.annotations[k][2].push(label.id)
          } else {
            alert('already there')
          }
          return 0
        }
      }
      const annotation = [this.start, this.end, [label.id]]
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
    key (e) {
      console.log('key pressed: ', e.key)
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
    saveAnnotations () {
      const data = {
        document: this.document.id,
        annotations: this.annotations
      }
      let url
      let method
      if (this.document.annotations.id) {
        method = 'patch'
        url = this.$hostname + '/annotations/' + this.document.annotations.id + '/'
      } else {
        method = 'post'
        url = this.$hostname + '/annotations/'
      }
      if (this.annotations.length === 0) {
        return
      }

      this.$axios({ method: method, url: url, data: data }).then(response => {
        // console.log(response.data)
      })
    },
    fetchDocs (url) {
      if (!url) {
        url = this.$hostname + '/documents/'
      } else {
        url = process.env.PROD ? url.replace('http://', 'https://') : url
      }
      this.$axios.get(url).then(response => {
        console.log('use host', this.$hostname)
        this.documents = response.data.results
        this.nextURL = response.data.next
        this.prevURL = response.data.previous
        this.document = this.documents[0]
        this.annotations = this.document.annotations.id ? this.document.annotations.annotations : []
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
  },
  computed: {
    categorizedAnnotations () {
      const results = {}
      this.annotations.forEach(a => {
        a[2].forEach(n => {
          const label = this.labels[n].name
          const word = this.tokens.slice(a[0], a[1] + 1).join(' ')
          const annotation = { index: [a[0], a[1]], word: word }
          if (results[label]) {
            results[label].push(annotation)
          } else {
            results[label] = [annotation]
          }
        })
      })
      return results
    },
    lLabels () {
      const results = {}
      Object.entries(this.labels).forEach(a => {
        results[a[1].name] = a[1]
      })
      return results
    }
  }
}
</script>
<style>
.token {
  font-size: 1.2em;
  font-family: "Roboto", "Lucida Grande", "DejaVu Sans", "Bitstream Vera Sans", Verdana, Arial, sans-serif;
}

.B, .I {
  /*text-decoration: underline red;*/
  /*text-decoration-style: wavy;*/
  border-bottom: blue solid 2px;
}

.B {
  margin-left: 3px;
}

.label {
  position: relative;
  margin-left: 3px;
}

.selected {
  border-bottom: red solid 2px;
}

::selection {
    background: none;
}

.label-window {
  position: absolute;
  margin-top: 1.8em;
  font-size: 1.3em;
  z-index: 10;
}

.summary {
  border-left: #a6b4cd solid 1px;
  padding-left: 1em;
}
.summary-label {
  font-weight: bolder;
}
.summary-word {
  padding-left: 2em;
  margin-block-start: 0px;
}
</style>
