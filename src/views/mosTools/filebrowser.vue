<template>
  <v-container fluid class="d-flex justify-center">
    <!-- Bookmarks Sidebar -->
    <v-navigation-drawer v-model="bookmarksSidePanel.open" location="right" temporary width="350" :scrim="false">
      <template #prepend>
        <v-toolbar density="compact" class="bg-transparent">
          <v-toolbar-title class="text-subtitle-2">{{ $t('bookmarks') }}</v-toolbar-title>
          <v-btn icon size="small" @click="bookmarksSidePanel.open = false" class="ml-auto">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider />
      </template>

      <v-card-text class="pa-2" style="overflow: auto; max-height: calc(100vh - 120px)">
        <v-alert v-if="bookmarksSidePanel.bookmarks.length === 0" type="info" variant="tonal" density="compact" class="mb-2">
          {{ $t('no bookmarks found') }}
        </v-alert>
        <div v-else>
          <draggable
            v-model="bookmarksSidePanel.bookmarks"
            tag="v-list"
            :component-data="{ density: 'compact', class: 'pa-0' }"
            item-key="path"
            class="bg-transparent"
            @end="onBookmarksReordered"
            handle=".drag-handle"
          >
            <template #item="{ element: bookmark }">
              <v-list-item :key="bookmark.path" class="cursor-pointer pa-1" @click="navigateToBookmark(bookmark)">
                <template #prepend>
                  <div class="d-flex align-center gap-1">
                    <v-icon class="drag-handle cursor-grab" color="primary" size="18" style="opacity: 0.6">mdi-drag-vertical</v-icon>
                    <v-icon color="primary" size="18">mdi-bookmark</v-icon>
                  </div>
                </template>
                <v-list-item-title class="text-subtitle-2">{{ bookmark.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption" style="word-break: break-all">{{ bookmark.path }}</v-list-item-subtitle>
                <template #append>
                  <v-btn icon size="x-small" color="error" variant="text" @click.stop="deleteBookmark(bookmark.path)" :loading="bookmarksSidePanel.loading">
                    <v-icon size="18">mdi-trash-can</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </template>
          </draggable>
        </div>
      </v-card-text>
    </v-navigation-drawer>

    <v-container style="width: 100%; max-width: 1920px" class="pa-0">
      <v-container fluid class="pt-2 pr-0 pl-0 pb-2">
        <v-row>
          <div class="d-flex align-center ga-3 mb-4" style="height: 40px">
            <div style="width: 4px; height: 32px; border-radius: 2px; background: rgb(var(--v-theme-primary))"></div>
            <h2 class="font-weight-medium ma-0" style="font-weight: 600; line-height: 1.1">{{ $t('filebrowser') }}</h2>
          </div>
        </v-row>
      </v-container>
      <v-container fluid class="pa-0">
        <v-card class="pa-0">
          <v-card-title class="pa-0 pl-2 pr-2">
            <div class="d-flex align-center ga-2" style="width: 100%">
              <v-btn variant="text" icon="mdi-home" @click="goRoot()" color="primary" :disabled="loading" />
              <v-btn variant="text" icon="mdi-arrow-up" @click="goUp()" color="primary" :disabled="!canGoUp || loading" />
              <v-btn variant="text" icon="mdi-refresh" @click="reload()" color="primary" :disabled="loading" />
              <v-chip class="ml-2" variant="tonal">
                {{ currentPath || '/' }}
              </v-chip>
              <v-spacer />
              <!-- Bookmarks Quick Access -->
              <div v-if="bookmarksSidePanel.bookmarks.length > 0" class="d-none d-md-flex align-center" style="overflow-x: auto; padding: 0 8px; margin-right: 8px; gap: 4px">
                <v-chip
                  v-for="bookmark in bookmarksSidePanel.bookmarks"
                  :key="bookmark.path"
                  size="small"
                  color="primary"
                  variant="tonal"
                  @click="navigateToBookmark(bookmark)"
                  class="cursor-pointer flex-shrink-0"
                >
                  <v-icon start size="14">mdi-bookmark</v-icon>
                  {{ bookmark.path }}
                </v-chip>
              </div>
              <v-progress-circular v-if="loading" indeterminate size="20" color="primary" />
              <v-btn variant="flat" @click="openAllOperationsDialog()" color="primary" :disabled="loading" size="small">
                <span class="text-caption">{{ runningProcesses }} {{ $t('operations') }}</span>
              </v-btn>
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text
            class="pa-0 file-drop-zone"
            style="min-height: 300px; max-height: 75vh; overflow-y: auto; position: relative"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent
            @dragleave.prevent="onDragLeave"
            @drop.prevent="handleDrop"
          >
            <div
              v-if="dragOverTable"
              class="drop-overlay"
              style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(var(--v-theme-primary), 0.1);
                border: 2px dashed rgb(var(--v-theme-primary));
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                border-radius: 4px;
                pointer-events: none;
              "
            >
              <div class="d-flex flex-column align-center gap-2">
                <v-icon size="48" color="primary">mdi-cloud-upload-outline</v-icon>
                <span class="text-h6 text-primary">{{ $t('drop files to upload') }}</span>
              </div>
            </div>
            <v-table density="compact">
              <thead>
                <tr style="cursor: pointer; background-color: rgba(0, 0, 0, 0.04)">
                  <th style="width: 20%">{{ t('name') }}</th>
                  <th style="width: 20%">{{ t('path') }}</th>
                  <th class="size-column">{{ t('size') }}</th>
                  <th style="width: 10%; min-width: 100px">{{ t('owner') }}</th>
                  <th style="min-width: 30px">{{ t('permissions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!loading && items.length === 0">
                  <td colspan="5" class="text-center text-medium-emphasis">
                    {{ t('no entries') }}
                  </td>
                </tr>

                <tr
                  v-for="item in items"
                  :key="item.path"
                  :class="['cursor-pointer', 'no-select', isSelected(item) ? 'bg-primary bg-opacity-10' : '']"
                  @click="onRowClick($event, item)"
                  @dblclick.stop.prevent="handleRowDblClick(item)"
                  @contextmenu.prevent="openContextMenu($event, item)"
                >
                  <!-- ...Tabelleninhalt wie gehabt... -->
                  <td>
                    <div class="d-flex align-center ga-2">
                      <v-icon size="18">
                        {{ item.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}
                      </v-icon>
                      <span>{{ item.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.displayPath || item.path }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-center ga-1" style="overflow: hidden">
                      <span v-if="item.calculated_size_human" class="text-caption" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ item.calculated_size_human }}</span>
                      <span v-else-if="item.type !== 'directory'" class="text-caption" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ item.size_human }}</span>
                      <v-btn
                        v-if="item.type === 'directory'"
                        variant="text"
                        icon
                        size="x-small"
                        :loading="item.calculating"
                        @click.stop="calculateDirectorySize(item)"
                        title="Calculate directory size"
                        :color="isSelected(item) ? 'accent' : 'primary'"
                      >
                        <v-icon size="16">mdi-calculator</v-icon>
                      </v-btn>
                    </div>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.permissions.owner }}:{{ item.permissions.group }}</span>
                  </td>
                  <td>
                    <span class="text-caption">{{ item.permissions.octal }}</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-divider />
          <v-card-actions class="actions-toolbar pa-2">
            <v-tooltip :text="$t('create folder')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon @click="openCreateFolderDialog(currentPath)">
                  <v-icon size="20">mdi-folder-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('create file')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon @click="openCreateFileDialog(currentPath)">
                  <v-icon size="20">mdi-file-plus</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('edit')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem || activeItem.type === 'directory'" @click="openEditFileDialog(activeItem)">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('rename')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem" @click="openRenameFileDialog(activeItem)">
                  <v-icon size="20">mdi-rename</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('delete')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="selectedItems.length === 0" @click="openDeleteFileDialog(multiSelected ? selectedItems : activeItem)">
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('download')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="!activeItem || activeItem.type === 'directory'" @click="downloadFile(activeItem.path)">
                  <v-icon size="20">mdi-download</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('upload')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="loading" @click="openUploadPicker()">
                  <v-icon size="20">mdi-upload</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('copy')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="selectedItems.length === 0" @click="openOperationDialog(selectedItems, 'copy')">
                  <v-icon size="20">mdi-content-copy</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('move')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="selectedItems.length === 0" @click="openOperationDialog(selectedItems, 'move')">
                  <v-icon size="20">mdi-arrow-right-bold</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-divider vertical class="mx-1 align-self-center" style="height: 24px" />
            <v-tooltip :text="$t('adjust permissions')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="selectedItems.length === 0" @click="openChModDialog(multiSelected ? selectedItems : activeItem)">
                  <v-icon size="20">mdi-shield-key-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('adjust ownership')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon :disabled="selectedItems.length === 0" @click="openChOwnDialog(multiSelected ? selectedItems : activeItem)">
                  <v-icon size="20">mdi-account-key</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip :text="$t('bookmarks')" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="text" color="primary" icon @click="openBookmarksDialog()">
                  <v-icon size="20">mdi-bookmark-outline</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-spacer />
            <v-checkbox v-model="includeHiddenFiles" :label="$t('hidden files')" :disabled="loading" hide-details="auto" density="compact" @update:modelValue="loadPath(currentPath)" />
          </v-card-actions>

          <input ref="uploadInput" class="d-none" type="file" @change="onUploadPicked" />
        </v-card>
      </v-container>
    </v-container>
  </v-container>

  <!-- Delete File Dialog -->
  <v-dialog v-model="deleteFileDialog.value" max-width="500" persistent>
    <v-card
      class="pa-0"
      :title="deleteFileDialog.paths.length > 1 ? `${$t('delete')} - ${deleteFileDialog.paths.length} ${$t('items selected')}` : `${$t('delete')} - ${deleteFileDialog.path}`"
      prepend-icon="mdi-delete"
    >
      <v-card-text>
        <v-container class="pb-4 pt-0 px-0">{{ $t('are you sure you want to delete this file') }}?</v-container>
        <v-list v-if="deleteFileDialog.paths.length > 1" density="compact" class="mb-4 pa-0 text-caption bg-transparent" style="max-height: 200px; overflow-y: auto">
          <v-list-item v-for="p in deleteFileDialog.paths" :key="p" class="px-2" min-height="24">
            <span :title="p" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">• {{ p.split('/').pop() }}</span>
          </v-list-item>
        </v-list>
        <v-checkbox v-if="deleteFileDialog.pathType === 'directory'" v-model="deleteFileDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        <v-checkbox v-model="deleteFileDialog.force" :label="$t('force')" :disabled="loading" hide-details="auto" density="compact" />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="deleteFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="red" @click="confirmDelete">{{ $t('delete') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create Folder Dialog -->
  <v-dialog v-model="createFolderDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('create folder')" prepend-icon="mdi-folder-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFolderDialog.folderName" :label="$t('folder name')" :disabled="loading" />
          <v-select
            v-model="createFolderDialog.userddsel"
            :label="$t('user')"
            :items="createFolderDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFolderDialog.user = createFolderDialog.group = '500';
                else if (val === 'root') createFolderDialog.user = createFolderDialog.group = '0';
                else createFolderDialog.user = createFolderDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFolderDialog.userddsel === 'custom'" v-model="createFolderDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFolderDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFolderDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="createFolder(createFolderDialog.currentPath, createFolderDialog.folderName, createFolderDialog.user, createFolderDialog.group, createFolderDialog.permissions)">
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Create File Dialog -->
  <v-dialog v-model="createFileDialog.value" max-width="600" persistent>
    <v-card class="pa-0" :title="$t('create file')" prepend-icon="mdi-file-plus">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="createFileDialog.fileName" :label="$t('file name')" :disabled="loading" />
          <v-textarea v-model="createFileDialog.content" :label="$t('content')" :disabled="loading" rows="6" />
          <v-select
            v-model="createFileDialog.userddsel"
            :label="$t('user')"
            :items="createFileDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') createFileDialog.user = createFileDialog.group = '500';
                else if (val === 'root') createFileDialog.user = createFileDialog.group = '0';
                else createFileDialog.user = createFileDialog.group = '';
              }
            "
          />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="createFileDialog.userddsel === 'custom'" v-model="createFileDialog.group" :label="$t('group')" :disabled="loading" />
          <v-text-field v-model="createFileDialog.permissions" :label="$t('permissions')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="createFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn
          color="primary"
          @click="createFile(createFileDialog.currentPath, createFileDialog.fileName, createFileDialog.content, createFileDialog.user, createFileDialog.group, createFileDialog.permissions)"
        >
          {{ $t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chmod Dialog -->
  <v-dialog v-model="setChmodDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="setChmodDialog.paths.length > 1 ? `${$t('adjust permissions')} - ${setChmodDialog.paths.length} ${$t('items selected')}` : $t('adjust permissions')" prepend-icon="mdi-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="setChmodDialog.permissions" :label="$t('permissions')" :disabled="loading" />
          <v-checkbox v-model="setChmodDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChmodDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="confirmChmod">
          {{ $t('adjust') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Chown Dialog -->
  <v-dialog v-model="setChownDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="setChownDialog.paths.length > 1 ? `${$t('adjust ownership')} - ${setChownDialog.paths.length} ${$t('items selected')}` : $t('adjust ownership')" prepend-icon="mdi-account-lock">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-select
            v-model="setChownDialog.userddsel"
            :label="$t('user')"
            :items="setChownDialog.userdd"
            :disabled="loading"
            @update:modelValue="
              (val) => {
                if (val === 'mos') setChownDialog.user = setChownDialog.group = '500';
                else if (val === 'root') setChownDialog.user = setChownDialog.group = '0';
                else setChownDialog.user = setChownDialog.group = '';
              }
            "
          />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.user" :label="$t('user')" :disabled="loading" />
          <v-text-field v-if="setChownDialog.userddsel === 'custom'" v-model="setChownDialog.group" :label="$t('group')" :disabled="loading" />
          <v-checkbox v-model="setChownDialog.recursive" :label="$t('recursive')" :disabled="loading" hide-details="auto" density="compact" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="setChownDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="confirmChown">
          {{ $t('adjust') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Operation Dialog -->
  <v-dialog v-model="operationDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="operationDialog.operation === 'copy' ? $t('copy') : $t('move')" :prepend-icon="operationDialog.operation === 'copy' ? 'mdi-content-copy' : 'mdi-arrow-right-bold'">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <div v-if="Array.isArray(operationDialog.source)" class="mb-4">
            <v-text-field
              :model-value="`${operationDialog.source.length} ${$t('items selected')}`"
              :label="$t('source path')"
              :append-inner-icon="operationDialog.showSources ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              readonly
              hide-details
              @click:append-inner="operationDialog.showSources = !operationDialog.showSources"
            />
            <v-expand-transition>
              <v-list v-if="operationDialog.showSources" density="compact" class="mt-1 pa-0 text-caption" style="max-height: 150px; overflow-y: auto">
                <v-list-item v-for="path in operationDialog.source" :key="path" class="px-2" min-height="24">
                  <span style="word-break: break-all">{{ path }}</span>
                </v-list-item>
              </v-list>
            </v-expand-transition>
          </div>
          <v-text-field v-else v-model="operationDialog.source" :label="$t('source path')" readonly />
          <v-text-field
            v-model="operationDialog.destination"
            :label="$t('destination path')"
            append-inner-icon="mdi-folder"
            @click:append-inner="
              openFsDialog((item) => {
                operationDialog.destination = item.path;
              })
            "
            required
          />
          <v-checkbox
            v-if="operationDialog.operation == 'copy'"
            :model-value="operationDialog.onConflict === 'overwrite'"
            @update:model-value="(val) => (operationDialog.onConflict = val ? 'overwrite' : 'fail')"
            :label="$t('overwrite')"
            hide-details="auto"
            density="compact"
          />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="operationDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="startFileOperation(operationDialog.operation, operationDialog.source, operationDialog.destination, operationDialog.onConflict)">
          {{ operationDialog.operation === 'copy' ? $t('copy') : $t('move') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rename File Dialog -->
  <v-dialog v-model="renameFileDialog.value" max-width="500" persistent>
    <v-card class="pa-0" :title="$t('rename')" prepend-icon="mdi-rename">
      <v-card-text class="py-0">
        <v-container class="px-0">
          <v-text-field v-model="renameFileDialog.new_name" :label="$t('new name')" :disabled="loading" />
        </v-container>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="onPrimary" @click="renameFileDialog.value = false">{{ $t('cancel') }}</v-btn>
        <v-btn color="primary" @click="renameFile({ path: renameFileDialog.destination }, renameFileDialog.new_name)">
          {{ $t('rename') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Kontextmenü für Datei/Ordner -->
  <v-menu v-model="contextMenu.visible" :target="[contextMenu.x, contextMenu.y]" :close-on-content-click="true">
    <v-list>
      <v-list-item v-if="contextMenu.item" density="compact" style="background: rgba(var(--v-theme-primary), 0.08); pointer-events: none">
        <template #prepend>
          <v-icon color="primary">{{ multiSelected ? 'mdi-file-multiple' : contextMenu.item?.type === 'directory' ? 'mdi-folder' : 'mdi-file' }}</v-icon>
        </template>
        <v-list-item-title style="color: rgb(var(--v-theme-primary))">
          {{ multiSelected ? `${selectedItems.length} ${$t('items selected')}` : contextMenu.item?.name }}
        </v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item v-if="contextMenu.item && contextMenu.item.type !== 'directory'" @click="openEditFileDialog(contextMenu.item)" density="compact" :disabled="multiSelected">
        <template #prepend><v-icon>mdi-pencil</v-icon></template>
        <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openRenameFileDialog(contextMenu.item)" density="compact" :disabled="multiSelected">
        <template #prepend><v-icon>mdi-rename</v-icon></template>
        <v-list-item-title>{{ $t('rename') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openDeleteFileDialog(multiSelected ? selectedItems : contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-delete</v-icon></template>
        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="contextMenu.item && contextMenu.item.type !== 'directory'" @click="downloadFile(contextMenu.item.path)" density="compact" :disabled="multiSelected">
        <template #prepend><v-icon>mdi-download</v-icon></template>
        <v-list-item-title>{{ $t('download') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="contextIsDirectories" @click="calculateSize(multiSelected ? selectedItems : contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-calculator</v-icon></template>
        <v-list-item-title>{{ $t('calculate directory size') }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-if="contextIsDirectories" @click="addAsBookmark(multiSelected ? selectedItems : contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-bookmark-plus</v-icon></template>
        <v-list-item-title>{{ $t('add as bookmark') }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item @click="openOperationDialog(multiSelected ? selectedItems : contextMenu.item, 'copy')" density="compact">
        <template #prepend><v-icon>mdi-content-copy</v-icon></template>
        <v-list-item-title>{{ $t('copy') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openOperationDialog(multiSelected ? selectedItems : contextMenu.item, 'move')" density="compact">
        <template #prepend><v-icon>mdi-arrow-right-bold</v-icon></template>
        <v-list-item-title>{{ $t('move') }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item @click="openChModDialog(multiSelected ? selectedItems : contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-shield-key-outline</v-icon></template>
        <v-list-item-title>{{ $t('adjust permissions') }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="openChOwnDialog(multiSelected ? selectedItems : contextMenu.item)" density="compact">
        <template #prepend><v-icon>mdi-account-key</v-icon></template>
        <v-list-item-title>{{ $t('adjust ownership') }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- All Operations Dialog -->
  <fsOperationsDialog v-model="allOperationsDialogVisible" persistent />

  <!-- Edit File Dialog -->
  <FileEditDialog v-model="editFileDialogVisible" :path="selectedFilePath" :createBackup="true" :title="$t('edit file')" persistent @saved="onFileSaved" />

  <!-- File System Navigator Dialog -->
  <fsNavigatorDialog v-model="fsDialog" :initial-path="'/'" select-type="directory" :title="$t('select directory')" persistent @selected="handleFsSelected" />
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive, onBeforeUnmount, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useOverlay } from '@/composables/useOverlay';
import { useApi } from '@/composables/useApi';
import { showSnackbarError, showSnackbarSuccess, showSnackbarWarning } from '@/composables/snackbar';
import FileEditDialog from '@/components/fileEditDialog.vue';
import fsNavigatorDialog from '@/components/fsNavigatorDialog.vue';
import fsOperationsDialog from '@/components/fsOperationsDialog.vue';
import draggable from 'vuedraggable';

const emit = defineEmits(['refresh-drawer', 'refresh-notifications-badge']);
const modelValue = ref(true);
const selectType = ref('all');
const roots = ref('');
const { t } = useI18n();
const { call } = useApi();
const loading = ref(false);
const currentPath = ref('/mnt');
const items = ref([]);
const canGoUp = ref(false);
const parentPath = ref(null);
const selectedPaths = ref([]);
const anchorPath = ref(null);
const selectedItems = computed(() => items.value.filter((i) => selectedPaths.value.includes(i.path)));
const multiSelected = computed(() => selectedItems.value.length > 1);
const activeItem = computed(() => (selectedItems.value.length === 1 ? selectedItems.value[0] : null));
const contextIsDirectories = computed(() =>
  multiSelected.value ? selectedItems.value.every((i) => i.type === 'directory') : contextMenu.item?.type === 'directory',
);
const dragOverTable = ref(false);
const dragCounter = ref(0);
const { overlay } = useOverlay();
const editFileDialogVisible = ref(false);
const fsDialog = ref(false);
const fsDialogCallback = ref(null);
const uploadInput = ref(null);
const selectedFilePath = ref('');
const runningProcesses = ref(0);
const allOperationsDialogVisible = ref(false);
const includeHiddenFiles = ref(false);
const deleteFileDialog = reactive({
  value: false,
  path: null,
  paths: [],
  pathType: '',
  recursive: false,
  force: false,
});
const createFolderDialog = reactive({
  value: false,
  folderName: '',
  currentPath: '',
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const createFileDialog = reactive({
  value: false,
  fileName: '',
  currentPath: '',
  content: '',
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  permissions: '777',
});
const setChmodDialog = reactive({
  value: false,
  path: '',
  paths: [],
  permissions: '777',
  recursive: false,
});
const setChownDialog = reactive({
  value: false,
  path: '',
  paths: [],
  userddsel: 'mos',
  userdd: ['mos', 'root', 'custom'],
  user: '500',
  group: '500',
  recursive: false,
});
const operationDialog = reactive({
  value: false,
  operation: '',
  source: '',
  destination: '',
  onConflict: 'fail',
  showSources: false,
});
const renameFileDialog = reactive({
  value: false,
  destination: '',
  new_name: '',
});
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  item: null,
});
const bookmarksSidePanel = reactive({
  open: false,
  bookmarks: [],
  newBookmarkName: '',
  loading: false,
});
let pollInterval = null;

onMounted(() => {
  loadPath(currentPath.value);
  getRunningOperations();
  loadBookmarks();
  pollInterval = setInterval(() => {
    getRunningOperations();
  }, 3000);
});

onBeforeUnmount(() => {
  clearInterval(pollInterval);
});

const openFsDialog = (cb) => {
  fsDialogCallback.value = cb;
  fsDialog.value = true;
};
const handleFsSelected = (item) => {
  if (typeof fsDialogCallback.value === 'function') {
    fsDialogCallback.value(item);
  }
  fsDialogCallback.value = null;
  fsDialog.value = false;
};

const loadPath = async (path = '/') => {
  loading.value = true;
  try {
    const url = new URL('/api/v1/mos/fsnavigator', window.location.origin);
    if (path && path !== '/') {
      url.searchParams.set('path', path);
    }
    if (includeHiddenFiles.value) {
      url.searchParams.set('includeHidden', 'true');
    }

    const typeParam = selectType.value === 'directory' ? 'directories' : 'all';
    url.searchParams.set('type', typeParam);

    if (roots.value !== '' && roots.value !== '/') {
      url.searchParams.set('roots', roots.value);
    }

    const data = await call(url.pathname + url.search, {
      errorLabel: t('filesystem could not be loaded'),
      showOverlay: false,
    });

    currentPath.value = data.currentPath || path || '/';
    canGoUp.value = !!data.canGoUp;
    parentPath.value = data.parentPath;
    items.value = Array.isArray(data.items) ? data.items : [];
    selectedPaths.value = [];
    anchorPath.value = null;
  } finally {
    loading.value = false;
  }
};

const deleteFile = async (path, force = false, recursive = false, { batch = false } = {}) => {
  const payload = { path: path, force: force, recursive: recursive };
  try {
    await call('/api/v1/mos/delete', {
      method: 'POST',
      body: payload,
      errorLabel: t('file could not be deleted'),
      showError: !batch,
      successLabel: batch ? undefined : t('successfully deleted'),
      showOverlay: !batch,
    });
    return true;
  } catch (e) {
    return false;
  } finally {
    if (!batch) {
      reload();
      clearDeleteDialog();
    }
  }
};

const confirmDelete = () => {
  const { path, paths, force, recursive } = deleteFileDialog;
  if (paths.length > 1) return deleteMultipleFiles(paths, force, recursive);
  return deleteFile(path, force, recursive);
};

// Runs fn sequentially for every entry with the overlay shown; returns the number of failures
const runBatch = async (entries, fn) => {
  overlay.value = true;
  let failed = 0;
  try {
    for (const entry of entries) {
      if (!(await fn(entry))) failed++;
    }
  } finally {
    overlay.value = false;
  }
  return failed;
};

const reportBatch = (total, failed, successKey, failKey) => {
  const ok = total - failed;
  if (failed === 0) showSnackbarSuccess(t(successKey, ok));
  else showSnackbarWarning(`${t(successKey, ok)}, ${t(failKey, failed)}`);
};

const deleteMultipleFiles = async (paths, force = false, recursive = false) => {
  deleteFileDialog.value = false;
  let failed = 0;
  try {
    failed = await runBatch(paths, (path) => deleteFile(path, force, recursive, { batch: true }));
  } finally {
    clearDeleteDialog();
  }
  reportBatch(paths.length, failed, 'items successfully deleted', 'items could not be deleted');
  reload();
};

const createFolder = async (path, folderName, user = '500', group = '500', permissions = '777') => {
  if (!folderName || folderName.trim() === '') {
    showSnackbarError(t('folder name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + folderName, user: user, group: group, permissions: permissions };

  try {
    await call('/api/v1/mos/createfolder', {
      method: 'POST',
      body: payload,
      errorLabel: t('folder could not be created'),
      successLabel: t('successfully created folder'),
    });
    reload();
  } catch (e) {
  } finally {
    createFolderDialog.value = false;
  }
};

const createFile = async (path, fileName, content = '', user = '500', group = '500', permissions = '777') => {
  if (!fileName || fileName.trim() === '') {
    showSnackbarError(t('file name cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }
  const payload = { path: path + '/' + fileName, content: content, user: user, group: group, permissions: permissions };

  try {
    await call('/api/v1/mos/createfile', {
      method: 'POST',
      body: payload,
      errorLabel: t('file could not be created'),
      successLabel: t('successfully created file'),
    });
    reload();
  } catch (e) {
  } finally {
    createFileDialog.value = false;
  }
};

const setChmod = async (path, permissions = '777', recursive = false, { batch = false } = {}) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return false;
  }
  const payload = { path: path, permissions: permissions, recursive: recursive };

  try {
    await call('/api/v1/mos/chmod', {
      method: 'POST',
      body: payload,
      errorLabel: t('permissions could not be set'),
      showError: !batch,
      successLabel: batch ? undefined : t('permissions successfully set'),
      showOverlay: !batch,
    });
    if (!batch) reload();
    return true;
  } catch (e) {
    return false;
  } finally {
    if (!batch) setChmodDialog.value = false;
  }
};

const setChmodMultiple = async (paths, permissions = '777', recursive = false) => {
  setChmodDialog.value = false;
  const failed = await runBatch(paths, (path) => setChmod(path, permissions, recursive, { batch: true }));
  reportBatch(paths.length, failed, 'items permissions set', 'items permissions could not be set');
  reload();
};

const confirmChmod = () => {
  const { path, paths, permissions, recursive } = setChmodDialog;
  if (paths.length > 1) return setChmodMultiple(paths, permissions, recursive);
  return setChmod(path, permissions, recursive);
};

const setChown = async (path, user = '500', group = '500', recursive = false, { batch = false } = {}) => {
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return false;
  }
  const payload = { path: path, user: user, group: group, recursive: recursive };

  try {
    await call('/api/v1/mos/chown', {
      method: 'POST',
      body: payload,
      errorLabel: t('ownership could not be set'),
      showError: !batch,
      successLabel: batch ? undefined : t('ownership successfully set'),
      showOverlay: !batch,
    });
    if (!batch) reload();
    return true;
  } catch (e) {
    return false;
  } finally {
    if (!batch) setChownDialog.value = false;
  }
};

const setChownMultiple = async (paths, user = '500', group = '500', recursive = false) => {
  setChownDialog.value = false;
  const failed = await runBatch(paths, (path) => setChown(path, user, group, recursive, { batch: true }));
  reportBatch(paths.length, failed, 'items ownership set', 'items ownership could not be set');
  reload();
};

const confirmChown = () => {
  const { path, paths, user, group, recursive } = setChownDialog;
  if (paths.length > 1) return setChownMultiple(paths, user, group, recursive);
  return setChown(path, user, group, recursive);
};

const startFileOperation = async (operation, source, destination, onConflict = 'fail') => {
  if (Array.isArray(source) ? source.length === 0 : !source || source.trim() === '') {
    showSnackbarError(t('source path cannot be empty'));
    return;
  }
  if (!destination || destination.trim() === '') {
    showSnackbarError(t('destination path cannot be empty'));
    return;
  }

  const payload = {
    operation: operation,
    source: source,
    destination: destination,
    onConflict: onConflict,
  };

  try {
    const result = await call('/api/v1/mos/fileoperations', {
      method: 'POST',
      body: payload,
      errorLabel: t('process could not be started'),
    });

    if (result?.instantMove === true) {
      showSnackbarSuccess(t('file operation completed successfully'));
    } else {
      showSnackbarSuccess(`${t('process successfully started')}. ${t('it may take a while')}`);
    }
    reload();
  } catch (e) {
  } finally {
    operationDialog.value = false;
  }
};

const getRunningOperations = async () => {
  try {
    const data = await call('/api/v1/mos/runningfsoperations', {
      errorLabel: t('could not fetch running operations'),
      showOverlay: false,
    });
    runningProcesses.value = data?.count || 0;
  } catch (e) {}
};

const renameFile = async (item, newName) => {
  if (!item || !newName || newName.trim() === '') {
    showSnackbarError(t('new name cannot be empty'));
    return;
  }
  const payload = { destination: item.path, new_name: newName };

  try {
    await call('/api/v1/mos/rename', {
      method: 'POST',
      body: payload,
      errorLabel: t('file could not be renamed'),
      successLabel: t('successfully renamed'),
    });
    reload();
    renameFileDialog.value = false;
  } catch (e) {
  } finally {
    editFileDialogVisible.value = false;
  }
};

const downloadFile = async (filePath) => {
  overlay.value = true;

  try {
    const res = await fetch(`/api/v1/mos/download?path=${encodeURIComponent(filePath)}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`${t('file could not be downloaded')}|$| ${error.error || t('unknown error')}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let filename = filePath.split('/').pop() || 'download';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    const [userMessage, apiErrorMessage] = e.message.split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const openUploadPicker = () => {
  if (loading.value) return;
  uploadInput.value?.click?.();
};

const onUploadPicked = async (e) => {
  const input = e?.target;
  const file = input?.files?.[0];
  if (!file) return;
  await uploadFile(file, currentPath.value);
  if (input) input.value = '';
};

const uploadFile = async (file, path = currentPath.value) => {
  if (!file) {
    showSnackbarError(t('file cannot be empty'));
    return;
  }
  if (!path || path.trim() === '') {
    showSnackbarError(t('path cannot be empty'));
    return;
  }

  try {
    overlay.value = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const res = await fetch('/api/v1/mos/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
      },
      body: formData,
    });

    if (!res.ok) {
      const errorDetails = await res.json().catch(() => ({}));
      throw new Error(`${t('file could not be uploaded')}|$| ${errorDetails.error || t('unknown error')}`);
    }

    const result = await res.json().catch(() => null);
    showSnackbarSuccess(t('file uploaded successfully'));
    reload();
    return result;
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e?.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    overlay.value = false;
  }
};

const isSelectable = (item) => {
  if (!item) return false;
  if (selectType.value === 'directory') return item.type === 'directory';
  if (selectType.value === 'file') return item.type !== 'directory';
  return true;
};

const onDragEnter = (e) => {
  dragCounter.value++;
  dragOverTable.value = true;
};

const onDragLeave = (e) => {
  dragCounter.value--;
  if (dragCounter.value === 0) {
    dragOverTable.value = false;
  }
};

const handleDrop = async (e) => {
  dragCounter.value = 0;
  dragOverTable.value = false;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const fileArray = Array.from(files);

  for (const file of fileArray) {
    await uploadFile(file, currentPath.value);
  }
};

const isSelected = (item) => selectedPaths.value.includes(item.path);

const setSelection = (paths) => {
  selectedPaths.value = paths;
  selectedFilePath.value = paths.length === 1 ? paths[0] : '';
};

const onRowClick = (e, item) => {
  if (e.ctrlKey || e.metaKey) {
    setSelection(isSelected(item) ? selectedPaths.value.filter((p) => p !== item.path) : [...selectedPaths.value, item.path]);
    anchorPath.value = item.path;
  } else if (e.shiftKey && anchorPath.value) {
    const from = items.value.findIndex((i) => i.path === anchorPath.value);
    const to = items.value.findIndex((i) => i.path === item.path);
    if (from === -1 || to === -1) {
      setSelection([item.path]);
      anchorPath.value = item.path;
    } else {
      const [start, end] = from < to ? [from, to] : [to, from];
      setSelection(items.value.slice(start, end + 1).map((i) => i.path));
    }
  } else {
    setSelection([item.path]);
    anchorPath.value = item.path;
  }
};

const navigateInto = (item) => {
  if (!item || item.type !== 'directory') return;
  loadPath(item.path);
};

const handleRowDblClick = (item) => {
  if (!item) return;
  if (item.type === 'directory') {
    navigateInto(item);
  } else if (isSelectable(item)) {
    confirmSelect(item);
  }
};

const goRoot = () => {
  loadPath('/');
};

const goUp = () => {
  if (!canGoUp.value || !parentPath.value) return;
  loadPath(parentPath.value);
};

const reload = () => {
  loadPath(currentPath.value || '/');
};

const onFileSaved = () => {
  loadPath(currentPath.value || '/');
};

const confirmSelect = (explicitItem) => {
  const item = explicitItem || activeItem.value;
  if (!item || !isSelectable(item)) return;
};

watch(
  () => modelValue.value,
  (visible) => {
    if (visible) {
      const startPath = initialPath.value || '/';
      loadPath(startPath);
    }
  },
);

const openDeleteFileDialog = (itemOrItems) => {
  const list = (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]).filter(Boolean);
  if (list.length === 0) return;
  deleteFileDialog.value = true;
  deleteFileDialog.path = list[0].path;
  deleteFileDialog.paths = list.map((i) => i.path);
  deleteFileDialog.pathType = list.some((i) => i.type === 'directory') ? 'directory' : list[0].type;
  deleteFileDialog.recursive = false;
  deleteFileDialog.force = false;
};
const clearDeleteDialog = () => {
  deleteFileDialog.value = false;
  deleteFileDialog.path = null;
  deleteFileDialog.paths = [];
  deleteFileDialog.pathType = '';
  deleteFileDialog.recursive = false;
  deleteFileDialog.force = false;
};
const openEditFileDialog = (item) => {
  if (!item || item.type === 'directory') return;
  selectedFilePath.value = item.path;
  editFileDialogVisible.value = true;
};
const openCreateFolderDialog = (currentPath) => {
  createFolderDialog.value = true;
  createFolderDialog.currentPath = currentPath;
  createFolderDialog.folderName = '';
  createFolderDialog.userddsel = 'mos';
  createFolderDialog.user = '500';
  createFolderDialog.group = '500';
  createFolderDialog.permissions = '777';
};
const openCreateFileDialog = (currentPath) => {
  createFileDialog.value = true;
  createFileDialog.currentPath = currentPath;
  createFileDialog.fileName = '';
  createFileDialog.content = '';
  createFileDialog.userddsel = 'mos';
  createFileDialog.user = '500';
  createFileDialog.group = '500';
  createFileDialog.permissions = '777';
};
const toList = (itemOrItems) => (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]).filter(Boolean);
const commonValue = (list, getter) => {
  const first = getter(list[0]);
  return list.every((i) => getter(i) === first) ? first : null;
};
const openChModDialog = (itemOrItems) => {
  const list = toList(itemOrItems);
  if (list.length === 0) return;
  setChmodDialog.value = true;
  setChmodDialog.path = list[0].path;
  setChmodDialog.paths = list.map((i) => i.path);
  setChmodDialog.permissions = commonValue(list, (i) => i.permissions.octal) ?? '';
  setChmodDialog.recursive = false;
};
const openChOwnDialog = (itemOrItems) => {
  const list = toList(itemOrItems);
  if (list.length === 0) return;
  const owner = commonValue(list, (i) => i.permissions.owner);
  setChownDialog.value = true;
  setChownDialog.path = list[0].path;
  setChownDialog.paths = list.map((i) => i.path);
  setChownDialog.userddsel = owner === 'mos' ? 'mos' : owner === 'root' ? 'root' : 'custom';
  setChownDialog.user = owner === 'mos' ? '500' : owner === 'root' ? '0' : '';
  setChownDialog.group = owner === 'mos' ? '500' : owner === 'root' ? '0' : '';
  setChownDialog.recursive = false;
};
const openOperationDialog = (itemOrItems, operation) => {
  const list = (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]).filter(Boolean);
  if (list.length === 0) return;
  operationDialog.value = true;
  operationDialog.source = list.length === 1 ? list[0].path : list.map((i) => i.path);
  operationDialog.destination = '';
  operationDialog.showSources = false;
  operationDialog.operation = operation;
  operationDialog.onConflict = 'fail';
};
const openRenameFileDialog = (item) => {
  renameFileDialog.value = true;
  renameFileDialog.destination = item.path;
  renameFileDialog.new_name = '';
};
const openAllOperationsDialog = () => {
  allOperationsDialogVisible.value = true;
};

const calculateSize = (itemOrItems) => {
  const dirs = toList(itemOrItems).filter((i) => i.type === 'directory');
  if (dirs.length === 0) return;
  if (dirs.length > 1) return calculateMultipleDirectorySizes(dirs);
  return calculateDirectorySize(dirs[0]);
};

const calculateDirectorySize = async (item, { batch = false } = {}) => {
  if (item.type !== 'directory') return false;

  try {
    item.calculating = true;
    const data = await call('/api/v1/mos/fsnavigator/calc', {
      method: 'POST',
      body: { path: item.path },
      errorLabel: t('error calculating directory size'),
      showError: !batch,
      successLabel: batch ? undefined : t('directory size calculated'),
      showOverlay: false,
    });

    if (data) {
      item.calculated_size_human = data.size_human;
    }
    return true;
  } catch (e) {
    return false;
  } finally {
    item.calculating = false;
  }
};

const calculateMultipleDirectorySizes = async (items) => {
  const results = await Promise.all(items.map((item) => calculateDirectorySize(item, { batch: true })));
  const failed = results.filter((ok) => !ok).length;
  reportBatch(items.length, failed, 'items size calculated', 'items size could not be calculated');
};

const openContextMenu = (e, item) => {
  e.preventDefault();
  if (!isSelected(item)) {
    setSelection([item.path]);
    anchorPath.value = item.path;
  }
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.item = item;
  contextMenu.visible = true;
};

const loadBookmarks = async () => {
  try {
    const data = await call('/api/v1/mos/fsnavigator/bookmarks', {
      errorLabel: t('bookmarks could not be loaded'),
    });
    bookmarksSidePanel.bookmarks = data || [];
  } catch (e) {
    bookmarksSidePanel.bookmarks = [];
  }
};

const openBookmarksDialog = () => {
  loadBookmarks();
  bookmarksSidePanel.open = true;
};

const navigateToBookmark = (bookmark) => {
  loadPath(bookmark.path);
  bookmarksSidePanel.open = false;
};

const deleteBookmark = async (path) => {
  bookmarksSidePanel.loading = true;
  try {
    await call('/api/v1/mos/fsnavigator/bookmarks', {
      method: 'DELETE',
      body: { path },
      successLabel: t('bookmark deleted successfully'),
      errorLabel: t('bookmark could not be deleted'),
    });

    await loadBookmarks();
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e?.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
  } finally {
    bookmarksSidePanel.loading = false;
  }
};

const onBookmarksReordered = async () => {
  try {
    await call('/api/v1/mos/fsnavigator/bookmarks', {
      method: 'POST',
      body: bookmarksSidePanel.bookmarks,
      successLabel: t('bookmarks saved successfully'),
      errorLabel: t('bookmarks could not be saved'),
    });
  } catch (e) {
    const [userMessage, apiErrorMessage] = String(e?.message || e).split('|$|');
    showSnackbarError(userMessage, apiErrorMessage);
    await loadBookmarks();
  }
};

const addAsBookmark = (itemOrItems) => {
  const dirs = toList(itemOrItems).filter((i) => i.type === 'directory');
  if (dirs.length === 0) return;
  if (dirs.length > 1) return addMultipleDirectoriesAsBookmarks(dirs);
  return addDirectoryAsBookmark(dirs[0]);
};

const addDirectoryAsBookmark = async (item, { batch = false } = {}) => {
  const bookmarkName = item.path.split('/').filter(Boolean).pop() || 'Bookmark';
  const payload = { name: bookmarkName, path: item.path };
  if (!batch) bookmarksSidePanel.loading = true;

  try {
    await call('/api/v1/mos/fsnavigator/bookmarks', {
      method: 'PUT',
      body: payload,
      successLabel: batch ? undefined : t('bookmark created successfully'),
      errorLabel: t('bookmark could not be created'),
      showError: !batch,
      showOverlay: !batch,
    });

    if (!batch) await loadBookmarks();
    return true;
  } catch (e) {
    if (!batch) {
      const [userMessage, apiErrorMessage] = String(e?.message || e).split('|$|');
      showSnackbarError(userMessage, apiErrorMessage);
    }
    return false;
  } finally {
    if (!batch) bookmarksSidePanel.loading = false;
  }
};

const addMultipleDirectoriesAsBookmarks = async (items) => {
  bookmarksSidePanel.loading = true;
  let failed = 0;
  try {
    failed = await runBatch(items, (item) => addDirectoryAsBookmark(item, { batch: true }));
    await loadBookmarks();
  } finally {
    bookmarksSidePanel.loading = false;
  }
  reportBatch(items.length, failed, 'items bookmarked', 'items could not be bookmarked');
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.no-select {
  user-select: none;
}
.actions-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.size-column {
  width: 10%;
  min-width: 200px;
}
@media (max-width: 768px) {
  .size-column {
    width: 15%;
    min-width: 200px;
  }
}
</style>
