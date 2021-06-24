<template>
  <q-page class="" style="background-color: #f6f6f6">
    <div class="row self-start">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el :label="review? 'Review': consensus? 'Check Consensus': 'Annotate'" icon="navigation" />
      </q-breadcrumbs>
    </div>
    <div class="row self-start q-pt-lg">
      <div class="col-3">
        <div class="justify-end  q-pr-md row">
          <q-card class="col-8 ">
            <q-linear-progress size="25px" :value="progressStats.pct" color="accent">
              <div class="absolute-full flex flex-center">
                <q-badge color="white" text-color="accent"
                         :label="progressStats.label" />
              </div>
            </q-linear-progress>

            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab name="models" :label="consensus? 'Consensus Models' : 'Models'"/>
              <q-tab v-if="!consensus" name="rules" label="Rules"/>
              <q-tab v-if="!consensus" name="dicts" label="Dictionaries"/>
            </q-tabs>

            <q-separator/>

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="models" v-if="!consensus">
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

<!--              consensus model results-->
              <q-tab-panel name="models" v-else>
                <div v-for="(m,i) in project.cmodels" :key="i">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-circular-progress show-value font-size="12px" :value="82" size="35px" :thickness="0.22" color="teal" track-color="grey-3" class="q-ma-md">
                    {{ 82 }}
                  </q-circular-progress>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
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
          <q-card-actions class="bg-white annotation-header">
            <q-btn v-for="(label,k) in labels" :key="k" outline size="sm" :style="`color: ${label.color}`" class="q-mr-xs" style="margin-left: 0px"> {{ label.name }}</q-btn>
          </q-card-actions>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 250px); display: flex" class="col">
          <div v-if="tokens && tokens.length>0" class="select-box q-pa-sm" @keyup="key" tabindex="0"
               @focusout="selected=[]" >
            <div v-for="(token,i) in tokens" :key="i" :id="`t-${i}`" :class="token[0]==='\r\n'? 'row q-my-sm' : 'column inline'">
              <!-- each token display -->
              <span class="q-pt-xs token" :class="getTokenClass(i)" :id="selected[0]===i? 'selected' : null"
                    v-on:mousedown="selectStart(i);mousePressed=true"
                    v-on:mouseup="selectEnd(i);mousePressed=false"
                    v-on:mouseover="mousePressed && select(i)">
                <span class="token q-pr-sm" v-if="!isPunct(i)"></span>
                {{ token[0] }}
                <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0">
                  <div v-for="(label,k) in detailedAnnotations[i]" :key="k">
                    <div :style="`height: ${k==0? 1: 4}px; margin-top: ${isPunct(i)? 2: 0}px; border-bottom: solid ${getColor(label[1])} 1px; margin-left: ${label[0]=='B'? 8+k*2: 0}px`"></div>
                  </div>
                </span>
              </span>
              <!-- dropdown menu for labels -->
              <q-card v-if="selected[0]===i" class="label-window fixed q-px-md q-py-sm" id="label-window" :style="`top: ${offsetTop}px;`">
                <div v-for="(label,k) in labels" :key="k" class="col-12" :style="`color:${label.color}`">
                  <div v-if="detailedAnnotations[i] && detailedAnnotations[i].map(a=>a[1].id).includes(label.id)"
                       @click="removeAnnotation(i, findAnnotation(i, label.id))">
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
<!--              <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0" style="position: absolute;" :style="`margin-top: ${2.0}em`">-->
<!--                <div v-for="(label,k) in detailedAnnotations[i]" :key="k">-->
<!--                  <div v-if="label[0]==='B'" :style="`width:${getWidth(i,k)}px;height: ${1*(k+1)}px; border-bottom: solid ${getColor(label[1])} 1px; margin-left: ${k*2}px`"></div>-->
<!--                </div>-->
<!--              </span>-->
              <span v-if="detailedAnnotations[i]" @mouseover="activeLabel=`l-${i}`" @mouseleave="activeLabel=null"
                    :class="{'active-label shadow-4': activeLabel===`l-${i}`}" class="label"
                    style="position: absolute;" :style="`margin-top: ${2.7+detailedAnnotations[i].length*0.27}em`" :id="`l-${i}`">
                <span v-for="(label,j) in detailedAnnotations[i]" :key="`label${j}`" class="label" :style="`color:${getColor(label[1])}`">
                  <span v-if="label[0]==='B'" :style="`margin-left:${j*2}px`">
                    <q-avatar :style="`background-color:${getColor(label[1])}`" text-color="white" size="12px" v-if="label[1].m" @click="removeAnnotation(i, label[1])">
                      m
                    </q-avatar>
                    <q-icon v-else name="check_circle" @click="removeAnnotation(i, label[1])"/> {{ label[1].name }} <br>
                  </span>
                </span>
                <q-menu anchor="top right" self="top left" v-if="review">
                  <q-list bordered separator >
                  <q-item clickable v-for="(label, j) in detailedAnnotations[i]" :key="`label${j}`" dense>
                    <q-item-section>
                      <span class="text-bold">{{ label[1].name }} ({{ label[1].authors.length }})</span>
                      <div class="q-px-sm">
                        <div v-for="(author, ii) in label[1].authors" :key="`author${ii}`">
                          {{author}}
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                  </q-list>
                </q-menu>
              </span>
              <span v-if="detailedAnnotations[i]" :style="`height: ${detailedAnnotations[i].filter(a=>a[0]=='B').length*1.3 }em` "> </span>
            </div>
          </div>
        </q-scroll-area>
        <q-separator />
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
          <q-card-actions class="bg-accent annotation-header justify-between" :style="'color: white; font-weight: bold; font-size: 1.2em'">
            <q-btn label="ANNOTATIONS" flat @click="showTab='annotations'" :class="{'bg-purple-5': showTab=='annotations'}">
              <q-badge color="info" floating> {{annotations.length}}</q-badge>
            </q-btn>
            <q-btn icon="sort" class="float-right" flat @click="showTab='sort'" :class="{'bg-purple-5': showTab=='sort'}">
              <q-badge color="info" floating v-if="modelResultCache"> {{modelResultCache.length}}</q-badge>
            </q-btn>
            <q-btn v-if="review" icon="group" class="float-right" flat @click="showTab='annotators'" :class="{'bg-purple-5': showTab=='annotators'}">
              <q-badge color="info" floating v-if="annotations4Review"> {{Object.keys(annotations4Review).length}}</q-badge>
            </q-btn>
            <q-btn icon="visibility" class="float-right" flat @click="showTab='conflicts'" :class="{'bg-purple-5': showTab=='conflicts'}">
              <q-badge color="red" floating>{{ Object.keys(conflicts).length }}</q-badge>
            </q-btn>
          </q-card-actions>
          <q-scroll-area style="height: calc(100vh - 180px); display: flex" class="col">
<!--            categorized annotations-->
            <q-list bordered class="bg-white" v-if="tokens && showTab==='annotations'">
              <q-expansion-item v-for="(label, i) in Object.entries(categorizedAnnotations)" :key="i"
                                expand-separator :header-style="`color: ${(lLabels[label[0]]|lLabels[null]).color}`" header-class="header-label"
                                :label="`${label[0]} (${label[1].length})`">
                <div class="summary-word q-pb-sm">
                  <li v-for="(w, j) in label[1].sort((a,b)=>a.pos[0]-b.pos[0])" :key="j" style="list-style: circle">
                    <span>
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.tpos[0], w)"> m </q-avatar>
                      <span @click="scrollTo(w)">{{w.pos}} - {{w.text}}</span>
                    </span>
                  </li>
                </div>
              </q-expansion-item>
            </q-list>
<!--            model results review -->
            <q-list class="q-pa-sm" v-if="tokens && modelResultCache && showTab==='sort'">
              <div v-for="(label, i) in sortedModelResults" :key="i">
                <q-avatar color="red" size="12px" text-color="white" @click="removeAnnotation(label.tpos[0], label); removeFromModelCache(label.tpos[0], label)"> m </q-avatar>
                <span @click="scrollTo(label)">
                  ({{ label.confidence.toFixed(2) }}) {{label.pos}} - {{label.text}}
                </span>
              </div>
              <div class="flex justify-center">
                <q-btn label="Clear model results" color="primary" @click="modelResultCache=null" class="q-mt-sm"/>
              </div>
            </q-list>
<!--            conflict-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='conflicts'">
              <span v-if="Object.keys(conflicts).length===0" class="text-subtitle2 q-pa-sm"> Cool, there is no conflict</span>
              <q-item v-for="(label, i) in Object.entries(conflicts)" :key="i"
                                :label="`${label[0]} (${label[1].length})`">
                 <div class="">
                  <div v-for="(w, j) in label[1]" :key="j" style="list-style: circle">
                    <span>
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.tpos[0], w)"> m </q-avatar>
                      <q-avatar v-else size="12px"></q-avatar>
                      <span @click="scrollTo(w)">{{w.pos}} - {{w.text}} 【{{w.name}}】</span>
                    </span>
                  </div>
                </div>
              </q-item>
            </q-list>
<!--            list of annotators-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='annotators'">
              <q-item v-for="(anns, author, i) in annotations4Review" :key="i" clickable v-ripple class="q-pr-xs"
                      :active="activeAuthors.includes(author)" active-class="bg-teal-1 text-grey-8">
                <q-item-section>
                  <div @click="getAnnotations(author)" class="col-9">{{anns.author}} ({{anns.annotations.length}})</div>
                </q-item-section>
                <q-item-section side>
                  <q-btn-dropdown color="primary" flat size="sm" dense label="" :dropdown-icon="{1: 'check_circle', '-1': 'highlight_off', 2: 'redo'}[anns.status]">
                    <q-list bordered>
                      <q-item :class="{'text-positive': anns.status===1}" dense clickable v-ripple  @click="rejectOrAccept(anns, 1)">
                        <q-item-section avatar>
                          <q-icon :name="anns.status===1? 'check_circle': 'check'" flat size="sm"/>
                        </q-item-section>
                        <q-item-section>
                          Accept
                        </q-item-section>
                      </q-item>
                      <q-item :class="{'text-negative': anns.status===-1}" clickable v-ripple @click="rejectOrAccept(anns, -1)">
                        <q-item-section avatar>
                          <q-icon :name="anns.status===-1? 'highlight_off':'clear'" flat size="sm" />
                        </q-item-section>
                        <q-item-section>
                          Reject
                        </q-item-section>
                      </q-item>
                      <q-item :class="{'text-negative': anns.status===2}" clickable v-ripple @click="rejectOrAccept(anns, 2)">
                        <q-item-section avatar>
                          <q-icon name="redo" flat size="sm" />
                        </q-item-section>
                        <q-item-section>
                          Ask for redo
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Annotate',
  props: ['project', 'review', 'consensus'],
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
      offsetTop: null,
      isAnnotated: null,
      numAnnotated: 0,
      annotations4Review: null,
      showTab: 'annotations',
      activeAuthors: [],
      feedback: '',
      modelResultCache: null,
      activeLabel: null
    }
  },
  mounted () {
    // this.fetchLabels()
    this.project.labels.forEach(a => {
      this.labels[a.id] = a
    })
    const nullLabel = {
      id: null,
      description: 'a dummy label for labels which were createad in the project',
      color: '#e0e0e0',
      name: 'NULL'
    }
    this.labels.null = nullLabel

    this.fetchDocs()
    setTimeout(() => {
      this.$forceUpdate()
    })
  },
  methods: {
    rejectOrAccept (ann, status) {
      ann.status = ann.status === status ? 0 : status
      const url = `/api/annotations/${ann.id}/`
      const data = { status: ann.status }
      this.$axios.patch(url, data).then(response => {
        console.log(response.data)
      })
      this.annotations = this.mergeAnnotations(this.activeAuthors)
      this.getDetailedAnnotations()
      this.$forceUpdate()
    },
    getAnnotations (author) {
      const indx = this.activeAuthors.indexOf(author)
      if (indx >= 0) {
        this.activeAuthors.splice(indx, 1)
      } else {
        this.activeAuthors.push(author)
      }
      this.annotations = this.mergeAnnotations(this.activeAuthors)
      this.getDetailedAnnotations()
    },
    mergeAnnotations (ary) {
      if (!ary || ary.length === 0) {
        ary = Object.keys(this.annotations4Review)
      }
      const n = ary.length
      let result = []
      for (let i = 0; i < n; i++) {
        const ann = this.annotations4Review[ary[i]]
        if (ann.status === -1) { continue } // if rejected, skip
        result = result.concat(ann.annotations.map(a => { a.author = ann.author; return a }))
      }
      console.log(result.length)
      result.forEach(a => (a.authors = []))
      result = result.filter((ann, index, self) =>
        index === self.findIndex((t) => {
          if (String(t.pos) === String(ann.pos) && t.name === ann.name) {
            t.authors.push(result[index].author)
            return true
          }
          return false
        })
      )
      console.log(result.length)
      // console.log(result)

      return result
    },
    getColor (label) {
      // console.log(this.labels, label, label.id)
      return this.labels[label.id].color
    },
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
    existInAnnotations (annotation) {
      return this.annotations.some(a => {
        if (a.pos[0] === annotation.pos[0] && a.pos[1] === annotation.pos[1] && a.name === annotation.name) {
          return true
        } else {
          return false
        }
      })
    },
    findAnnotation (i, lid) {
      let ann
      this.detailedAnnotations[i].forEach(a => {
        console.log('find', a[1])
        if (a[1].id === lid) {
          ann = a[1]
        }
      })
      return ann
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
          ann.id = this.lLabels[ann.name] ? this.lLabels[ann.name].id : null // returned label may not included in project labels
          const annotation = ann
          if (!this.existInAnnotations(annotation)) {
            this.annotations.push(annotation)
          }
        })
        this.getDetailedAnnotations()
        this.removeFromQ(id)

        if (this.modelResultCache) {
          this.modelResultCache = this.modelResultCache.concat(results)
        } else {
          this.modelResultCache = results
        }
        const msg = `Finished running model, and got ${results.length} results`
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          timeout: 0,
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } },
            { label: 'Review', color: 'white', handler: () => { this.showTab = 'sort' } }
          ]
        })
        // this.$forceUpdate()
        // process return annotations
      })
    },
    scrollTo (label) {
      let indx = label.tpos
      if (indx[0] > indx[1]) {
        indx = [indx[0], indx[0]]
      }
      const id = `t-${indx[0]}`
      this.highlighted = Array(indx[1] - indx[0] + 1).fill(indx[0]).map((x, y) => x + y)
      document.getElementById(id).scrollIntoView({ block: 'center' })
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
      cls = this.detailedAnnotations[i] ? this.detailedAnnotations[i][0][0] : ''
      cls += this.selected.includes(i) ? ' selected' : ''
      cls += this.highlighted.includes(i) ? ' highlight' : ''

      return cls
    },
    isPunct (i) {
      const punct = '.,!"\''
      const t = this.tokens[i][0][0]
      return punct.includes(t)
    },
    getWidth (i, k) {
      let w = 0
      const tpos = this.detailedAnnotations[i][k][1].tpos
      // console.log(this.detailedAnnotations[i][k][1].text)
      for (let j = tpos[0]; j < tpos[1] + 1; j++) {
        const e = document.getElementById('t-' + j)
        if (e) {
          w += e.offsetWidth
          // console.log(e, w)
        }
      }
      return w
    },
    annotate (label) {
      const startChar = this.tokens[this.start][2]
      const endChar = this.tokens[this.end][2] + (this.tokens[this.end][0].length - 1)
      const labelObj = {
        id: label.id,
        name: label.name,
        pos: [startChar, endChar],
        tpos: [this.start, this.end],
        text: this.document.text.substring(startChar, endChar + 1)
      }

      for (let k = 0; k < this.annotations.length; k++) {
        const ann = this.annotations[k]
        if (ann.pos[0] === labelObj.pos[0] && ann.pos[1] === labelObj.pos[1]) {
          if (ann.id === label.id) {
            alert('already there')
            return 0
          } else {
            // const idx = this.annotations.indexOf(labelObj)
            this.annotations.splice(k, 1)
          }
        }
      }
      // console.log('label', labelObj)
      this.annotations.push(labelObj)
      this.getDetailedAnnotations()
    },
    removeFromModelCache (i, label) {
      const idx = this.modelResultCache.indexOf(label)
      this.modelResultCache.splice(idx, 1)
    },
    removeAnnotation (i, label) {
      const idx = this.annotations.indexOf(label)
      console.log('find label', idx, label)
      this.annotations.splice(idx, 1)
      console.log(this.annotations.length)

      this.getDetailedAnnotations()
    },
    key (e) {
      console.log('key pressed: ', e.key)
    },
    compressAnnotations () {
      // convert detailed annotations into compressed (index-based) format
    },
    saveAnnotations () {
      if (Object.keys(this.conflicts).length > 0) {
        const msg = 'You must resolve all conflicts before saving.'
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
          ]
        })
        return -1
      }
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
        if (!this.isAnnotated && data.annotations.length >= 1) {
          this.incrProgress(1)
        } else if (this.isAnnotated && data.annotations.length === 0) {
          this.incrProgress(-1)
        }
        // console.log(response.data)
      })
    },
    incrProgress (n) {
      this.numAnnotated += n
    },
    fetchDocs (url) {
      if (!url) {
        url = `/api/documents/?project=${this.project.id}&review=${this.review}`
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
        this.annotations4Review = this.document.reviews
        if (this.review) {
          this.annotations = this.mergeAnnotations()
        }
        this.isAnnotated = this.document.annotations.id
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
        if (!a.name) {
          a.name = this.labels[a.id].name
        }
        const start = a.tpos[0]
        const end = a.tpos[1]
        const startChar = a.pos[0]
        const endChar = a.pos[1]
        // const label = [a] // todo: if review mode or machine, could have multiple values
        let label
        for (let i = 0; i < this.tokens.length; i++) {
          if (this.tokens[i][2] === startChar) {
            a.tpos[0] = i
            if (start === end) {
              a.tpos[1] = i
            }
            label = ['B', a] // B: beginning
            if (!this.detailedAnnotations[i]) {
              this.detailedAnnotations[i] = []
            }
            this.detailedAnnotations[i].push(label)
          } else if (this.tokens[i][2] > startChar && this.tokens[i][2] < endChar) {
            a.tpos[1] = i
            label = ['I', a]
            if (!this.detailedAnnotations[i]) {
              this.detailedAnnotations[i] = []
            }
            this.detailedAnnotations[i].push(label)
          }
        }
      })
      // console.log(this.detailedAnnotations)
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
    sortedModelResults () {
      const ary = JSON.parse(JSON.stringify(this.modelResultCache))
      return ary.sort((a, b) => b.confidence - a.confidence)
    },
    progressStats () {
      const totalAnnotated = (this.project.num_of_annotated_docs + this.numAnnotated)
      const pct = totalAnnotated / this.project.num_of_docs
      const label = (pct * 100).toFixed(2) + '%' + ` (${totalAnnotated}/${this.project.num_of_docs})`
      return {
        pct: pct,
        label: label
      }
    },
    categorizedAnnotations () {
      // { 'label': [ {word: 'xxx', index: [12, 15]}, ...]
      const results = {}
      this.annotations.forEach(a => {
        [a].forEach(ann => {
          const name = ann.name || this.labels[ann.id].name
          if (results[name]) {
            results[name].push(ann)
          } else {
            results[name] = [ann]
          }
        })
      })
      return results
    },
    conflicts () {
      const d = {}
      this.annotations.forEach(a => {
        const k = JSON.stringify(a.pos)
        if (d[k]) {
          d[k].push(a)
        } else {
          d[k] = [a]
        }
      })

      const r = {}
      Object.keys(d).forEach(k => {
        if (d[k].length > 1) {
          r[k] = d[k]
        }
      })
      return r
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
          const token = document.getElementById('selected').getBoundingClientRect()
          const tokenY = token.top
          const wH = document.getElementById('label-window').getBoundingClientRect().height
          if (tokenY > wH + token.height) {
            this.offsetTop = tokenY - wH - token.height
          } else {
            this.offsetTop = tokenY
          }
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
  /*border-bottom: blue solid 2px;*/
}

.B {
  /*margin-left: 3px;*/
}

.label {
  position: relative;
  margin-left: 3px;
}

.selected {
  /*border-bottom: red solid 2px;*/
  background-color: lightgray;
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
  display: inline-block;
  font-size: 1.3em;
  z-index: 100;
  visibility: visible;
  overflow-y: auto;
  /*bottom: 0;*/
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
  /*height: 52px;*/
}
.header-label {
  font-weight: bold;
  font-size: 1.2em;
  text-transform: uppercase;
}
.active-label {
  z-index: 99;
  background-color: white;
  padding: 2px;
}
</style>
