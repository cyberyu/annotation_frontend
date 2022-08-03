<script lang="ts">
import Vue from 'vue'
import QUploaderBase from 'quasar/src/components/uploader/QUploaderBase.js'
import UploaderXHRMixin from 'quasar/src/components/uploader/uploader-xhr-mixin.js'

export default Vue.extend({
  name: 'AxiosUploader',
  mixins: [QUploaderBase, UploaderXHRMixin],
  methods: {
    upload () {
      if (this.canUpload === false) {
        return
      }

      const queue = this.queuedFiles.slice(0)
      this.queuedFiles = []

      // const factory = this.factory(queue)
      console.log(this)
      const factory = {
        url: this.url,
        method: this.method,
        headers: this.headers,
        formFields: this.formFields
      }
      console.log(factory)

      queue.forEach(file => {
        this.workingThreads++
        this.uploadFiles([file], factory)
      })
    },
    uploadFiles (files, factory) {
      const form = new FormData(), headers = {}

      if (factory.headers) {
        factory.headers.forEach(head => {
          headers[head.name] = head.value
        })
      }

      if (factory.formFields) {
        factory.formFields.forEach(field => {
          form.append(field.name, field.value)
        })
      }

      form.append(factory.fieldName, files[0], files[0].name)

      let uploadIndex = 0,
        uploadIndexSize = 0,
        uploadedSize = 0,
        maxUploadSize = 0,
        aborted

      const xhr = this.$axios(
        {
          url: factory.url,
          method: factory.method,
          data: form,
          headers: headers,
          onUploadProgress: (e) => {
            if (aborted === true) {
              return
            }
            const loaded = Math.min(maxUploadSize, e.loaded)

            this.uploadedSize += loaded - uploadedSize
            uploadedSize = loaded

            let size = uploadedSize - uploadIndexSize
            for (let i = uploadIndex; size > 0 && i < files.length; i++) {
              const file = files[i],
                uploaded = size > file.size

              if (uploaded) {
                size -= file.size
                uploadIndex++
                uploadIndexSize += file.size
                this.__updateFile(file, 'uploading', file.size)
              } else {
                this.__updateFile(file, 'uploading', size)
                return
              }
            }
          }
        })

      this.xhrs.push(xhr)
      this.$emit('uploading', { files, xhr })

      xhr
        .then(res => {
          this.uploadedFiles = this.uploadedFiles.concat(files)
          files.forEach(f => {
            this.__updateFile(f, 'uploaded')
          })
          this.$emit('uploaded', { files, xhr })
        })
        .catch(err => {
          console.log(err)
          aborted = true
          this.uploadedSize -= uploadedSize
          this.queuedFiles = this.queuedFiles.concat(files)
          files.forEach(f => {
            this.__updateFile(f, 'failed')
          })
          this.$emit('failed', { files, xhr })
        })
        .finally(() => {
          this.workingThreads--
          this.xhrs = this.xhrs.filter(x => x !== xhr)
        })

      files.forEach(file => {
        this.__updateFile(file, 'uploading', 0)
        file.xhr = xhr
        file.__abort = () => {
          xhr.abort()
        }
        maxUploadSize += file.size
      })

      this.$emit('uploading', { files, xhr })
      this.xhrs.push(xhr)
    }
  }
})
</script>

<style scoped>

</style>
