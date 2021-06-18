<template>
  <q-page class="" style="background-color: #f6f6f6">
    <div class="row self-start">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el label="Annotate" icon="navigation" />
      </q-breadcrumbs>
    </div>
    <div class="row self-start q-pt-lg">
      <!--      <div class=" col-2">-->
      <!--        <div v-for="(label,i) in labels" :key="i" class="col-12" @click="annotate(label)">-->
      <!--          {{label.name}}-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="col-3">
        <div class="justify-end  q-pr-md row">
          <q-card class="col-8 ">
            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab name="models" label="Models"/>
              <q-tab name="rules" label="Rules"/>
              <q-tab name="dicts" label="Dictionaries"/>
            </q-tabs>

            <q-separator/>

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="models">
                <div v-for="(m,i) in project.vmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.vmodels.length===0">
                  No model defined for this project yet
                </div>
              </q-tab-panel>

              <q-tab-panel name="rules">
                <div v-for="(m,i) in project.rules" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.rules.length===0">
                  No rule defined for this project yet
                </div>
              </q-tab-panel>

              <q-tab-panel name="dicts">
                <div v-for="(m,i) in project.dicts" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.dicts.length===0">
                  No dictionary defined for this project yet
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

      </div>

      <div class="col-6 bg-white">
          <q-card-actions class="bg-accent annotation-header">
            <q-btn v-for="(label,k) in labels" :key="k" outline color="white"> {{ label.name }}</q-btn>
          </q-card-actions>
        <q-scroll-area style="height: calc(100vh - 350px); display: flex" class="col">
          <div v-if="tokens" class="select-box q-pa-sm" @keyup="key" tabindex="0"
               @focusout="selected=[]" >
            <div v-for="(token,i) in tokens" :key="i" :id="`t-${i}`" :class="token[0]==='\r\n'? 'row q-my-sm' : 'column inline'">
              <!-- each token display -->
              <span class="q-pt-xs token" :class="getTokenClass(i)" :id="selected[0]===i? 'selected' : null"
                    v-on:mousedown="selectStart(i);mousePressed=true"
                    v-on:mouseup="selectEnd(i);mousePressed=false"
                    v-on:mouseover="mousePressed && select(i)">
                {{ token[0] }}
              </span>
              <!-- dropdown menu for labels -->
              <q-card v-if="selected[0]===i" class="label-window q-px-md q-py-sm" bordered :style="`top: ${offsetTop}px`">
                <div v-for="(label,k) in labels" :key="k" class="col-12" :style="`color:${label.color}`">
                  <div v-if="detailedAnnotations[i] && detailedAnnotations[i][1].map(a=>a.id).includes(label.id)"
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
              <!-- display label under token -->
              <span v-if="detailedAnnotations[i] && detailedAnnotations[i][0]==='B'" style="position: absolute;background-color: white" :style="`margin-top: ${2.5}em`">
                <span v-for="(label,j) in detailedAnnotations[i][1]" :key="`label${j}`" class="label" :style="`color:${labels[label.id].color}`">
                  <q-avatar color="red" size="15px" text-color="white" v-if="label.m" @click="removeAnnotation(i, label)"> m </q-avatar>
                  <q-icon v-else name="check_circle" @click="removeAnnotation(i, label)"/> {{ label.name }} <br>
                </span>
              </span>
              <span v-if="detailedAnnotations[i] && detailedAnnotations[i][0]==='B'" :style="`height: ${detailedAnnotations[i][1].length*1.3}em` "> </span>
            </div>
          </div>
        </q-scroll-area>
          <q-card-actions class="justify-center">
            <q-btn color="primary" label="Previous" :disable="!prevURL" class="justify-center"
                   @click="fetchDocs(prevURL)" style="width: 100px"/>
            <q-btn color="accent" label="Save" class="justify-center q-ml-md" @click="saveAnnotations()" :loading="saving" style="width: 100px">
                   <template v-slot:loading>
                     Saving...
                   </template>
            </q-btn>
            <q-btn color="primary" label="Next" class="justify-center q-ml-md"
                   @click="nextURL? fetchDocs(nextURL): $router.push('/')" style="width: 100px"/>
          </q-card-actions>
      </div>

      <div class="col-2 summary q-mb-none">
        <q-card>
          <q-card-actions class="bg-accent annotation-header" :style="'color: white; font-weight: bold; font-size: 1.2em'">
           ANNOTATIONS
          </q-card-actions>
          <q-list bordered class="rounded-borders bg-white" v-if="tokens">
            <q-expansion-item v-for="(label, i) in Object.entries(categorizedAnnotations)" :key="i"
                              expand-separator default-opened :header-style="`color: ${lLabels[label[0]].color}`" header-class="header-label"
                              :label="`${label[0]} (${label[1].length})`">
              <div class="summary-word q-pb-sm">
                <li v-for="(w, j) in label[1]" :key="j" style="list-style: circle">
                  <span @click="scrollTo(w)">
                    <q-avatar v-if="w.m" color="red" size="12px" text-color="white"> m </q-avatar>
                    {{w.pos}} - {{w.text}}
                  </span>
                </li>
              </div>
            </q-expansion-item>
          </q-list>
        </q-card>
<!--        <q-scroll-area style="height: 100%" v-if="tokens">-->
<!--          <div >-->
<!--            <div v-for="(label, i) in Object.entries(categorizedAnnotations)" :key="i" class="summary-block">-->
<!--              <div class="summary-label" ><span :style="`color: ${lLabels[label[0]].color}`">{{label[0]}}</span> ({{label[1].length}})</div>-->
<!--              <ul class="summary-word">-->
<!--                <li v-for="(w, j) in label[1]" :key="j">-->
<!--                  <span @click="scrollTo(w)">{{w.index}} - {{w.word}}</span>-->
<!--                </li>-->
<!--              </ul>-->
<!--            </div>-->
<!--          </div>-->
<!--        </q-scroll-area>-->
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
      doneFetchLabels: false,
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
      highlighted: [],
      mousePressed: false,
      nextURL: null,
      prevURL: null,
      tab: 'models',
      loading: false,
      saving: false,
      currentModel: null,
      modelQueue: [],
      processedQ: [],
      offsetTop: null
    }
  },
  mounted () {
    // this.fetchLabels()
    this.project.labels.forEach(a => {
      this.labels[a.id] = a
    })
    this.fetchDocs()
  },
  methods: {
    add2Q (id) {
      const minfo = this.tab + id
      this.modelQueue.push(minfo)
    },
    removeFromQ (id) {
      const minfo = this.tab + id
      const indx = this.modelQueue.indexOf(minfo)
      this.modelQueue.splice(indx, 1)
      this.processedQ.push(minfo)
    },
    executeModel (id) {
      this.add2Q(id)
      const data = {
        mtype: this.tab, // which type of model (rule, dict, model)
        id: id,
        document: this.document.id
      }
      this.$axios.post(this.$hostname + '/api/calculate/', data).then(response => {
        const results = response.data
        results.forEach(ann => {
          ann.m = 'm' // machine generated
          ann.id = this.lLabels[ann.name].id // todo: returned label may not included in project labels
          const annotation = [...ann.tpos, [ann]]
          this.annotations.push(annotation)
        })
        this.getDetailedAnnotations()

        this.removeFromQ(id)
        // this.$forceUpdate()
        // process return annotations
      })
    },
    scrollTo (label) {
      console.log(label)
      const indx = label.tpos
      const id = `t-${indx[0]}`
      this.highlighted = Array(indx[1] - indx[0] + 1).fill(indx[0]).map((x, y) => x + y)
      document.getElementById(id).scrollIntoView()
    },
    // fetchLabels () {
    //   const url = this.$hostname + '/api/labels/'
    //   this.$axios.get(url).then(response => {
    //     response.data.forEach(a => {
    //       this.labels[a.id] = a
    //     })
    //     this.doneFetchLabels = true
    //   })
    // },
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
      cls += this.highlighted.includes(i) ? ' highlight' : ''

      const punct = '.,!""\''
      const t = this.tokens[i][0]
      if (punct.includes(t)) {
        cls += ''
      } else {
        cls += ' q-pl-sm'
      }

      return cls
    },
    annotate (label) {
      const startChar = this.tokens[this.start][2]
      const endChar = this.tokens[this.end][2] + this.tokens[this.end][0].length
      const labelObj = {
        id: label.id,
        name: label.name,
        pos: [startChar, endChar],
        tpos: [this.start, this.end],
        text: this.document.text.substring(startChar, endChar)
      }
      for (let k = 0; k < this.annotations.length; k++) {
        if (this.annotations[k][0] === this.start) {
          if (!this.annotations[k][2].map(ann => ann.id).includes(label.id)) {
            this.annotations[k][2].push(labelObj)
          } else {
            alert('already there')
          }
          return 0
        }
      }
      // console.log('label', labelObj)
      const annotation = [this.start, this.end, [labelObj]]
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
    compressAnnotations () {
      // convert detailed annotations into compressed (index-based) format
    },
    saveAnnotations () {
      this.saving = true
      const data = {
        document: this.document.id,
        annotations: this.annotations
      }
      let url
      let method
      if (this.document.annotations.id) {
        method = 'patch'
        url = this.$hostname + '/api/annotations/' + this.document.annotations.id + '/'
      } else {
        method = 'post'
        url = this.$hostname + '/api/annotations/'
      }
      if (this.annotations.length === 0) {
        // todo: tell if modified
        console.log(0)
      }

      this.$axios({ method: method, url: url, data: data }).then(response => {
        this.saving = false
        console.log('saving...')
        // console.log(response.data)
      })
    },
    fetchDocs (url) {
      if (!url) {
        url = '/api/documents/' + '?project=' + this.project.id
      } else {
        const n = url.split('/').length
        url = '/' + url.split('/').splice(n - 3, n).join('/')
        // console.log('hostname', this.$hostname)
        // console.log('next url', url)
      }
      this.$axios.get(url).then(response => {
        // console.log('use host', this.$hostname)
        this.documents = response.data.results
        this.nextURL = response.data.next
        this.prevURL = response.data.previous
        this.document = this.documents[0]
        this.annotations = this.document.annotations.id ? this.document.annotations.annotations : []
        this.tokens = this.document.tokens
        // this.tokens = this.document.text.split(' ')
        // this.tokens = []
        // this.document.text.split('\n').forEach(s => {
        //   this.tokens.push(...s.split(' '))
        //   this.tokens.push('\n')
        // })
        this.getDetailedAnnotations()
        this.highlighted = []
        this.processedQ = []
      })
    },
    getDetailedAnnotations () {
      // convert annotations into detailed token based format
      // [ ['B/I': [label.id, label.id]], ... ]
      this.detailedAnnotations = new Array(this.tokens.length)
      this.annotations.forEach(a => {
        const start = a[0]
        const end = a[1]
        const labels = a[2]
        for (let i = start; i <= end; i++) {
          if (i === start) {
            this.detailedAnnotations[i] = ['B', labels] // B: beginning
          } else {
            this.detailedAnnotations[i] = ['I', labels]
          }
        }
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
    },
    getTokenOffsetTop (i) {
      const id = 't-' + i
      return document.getElementById(id).getBoundingClientRect().top
    }
  },
  computed: {
    categorizedAnnotations () {
      // { 'label': [ {word: 'xxx', index: [12, 15]}, ...]
      const results = {}
      this.annotations.forEach(a => {
        a[2].forEach(ann => {
          const name = ann.name
          if (results[name]) {
            results[name].push(ann)
          } else {
            results[name] = [ann]
          }
        })
      })
      return results
    },
    lLabels () {
      // convert to format like
      // { 'label name' : { ...properties}}
      const results = {}
      Object.entries(this.labels).forEach(a => {
        results[a[1].name] = a[1]
      })
      return results
    }
  },
  watch: {
    selected (v) {
      this.highlighted = []
      this.$nextTick(() => {
        if (v.length > 0) {
          this.offsetTop = document.getElementById('selected').getBoundingClientRect().top
          console.log('top', this.offsetTop)
        }
      })
    }
  }
}
</script>
<style>
.token {
  font-size: 1.3em;
  /*font-family: "Roboto", "Lucida Grande", "DejaVu Sans", "Bitstream Vera Sans", Verdana, Arial, sans-serif;*/
  font-family: "Lato", "Trebuchet MS", Roboto, Helvetica, Arial, sans-serif;
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

.highlight {
  background-color: red;
}

::selection {
    background: none;
}

.label-window {
  position: fixed;
  margin-top: 1.8em;
  /*position: fixed;*/
  /*margin-top: -1.8em;*/
  font-size: 1.3em;
  z-index: 10;
}

.summary {
  /*border-left: #a6b4cd solid 1px;*/
  padding-left: 1em;
}
.summary-label {
  font-weight: bolder;
}
.summary-word {
  padding-left: 2em;
  margin-block-start: 0px;
}
.annotation-header {
  height: 52px;
}
.header-label {
  font-weight: bold;
  font-size: 1.2em;
  text-transform: uppercase;
}
</style>
