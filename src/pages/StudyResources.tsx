"use client"

import type React from "react"

import { DashboardLayout } from "../components/DashboardLayout"
import { motion } from "framer-motion"
import {
  Search,
  FolderPlus,
  Upload,
  FileText,
  Folder,
  MoreVertical,
  Filter,
  Loader2,
  Trash,
  Edit,
  Eye,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useApi } from "../lib/api/ApiContext"
import type { Resource } from "../lib/api/resourceService"

export function StudyResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { resourceService } = useApi()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        const data = await resourceService.getResources(currentFolder)
        setResources(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching resources:", err)
        setError("Failed to load resources. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [resourceService, currentFolder])

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:")
    if (!folderName) return

    try {
      const newFolder = await resourceService.createResource({
        name: folderName,
        type: "folder",
        parentId: currentFolder,
      })

      setResources([...resources, newFolder])
    } catch (err) {
      console.error("Error creating folder:", err)
      setError("Failed to create folder. Please try again.")
    }
  }

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId)
  }

  const handleBackClick = async () => {
    if (!currentFolder) return

    try {
      // Find the parent of the current folder
      const currentFolderData = await resourceService.getResource(currentFolder)
      setCurrentFolder(currentFolderData.parentId)
    } catch (err) {
      console.error("Error navigating back:", err)
      setCurrentFolder(undefined)
    }
  }

  const handleUploadClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setLoading(true)
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a FormData object
        const formData = new FormData()

        // Log file properties for debugging
        console.log("Uploading file:", {
          name: file.name,
          size: file.size,
          type: file.type,
        })

        // Append file with key 'file' (this must match the backend multer config)
        formData.append("file", file)

        // Append other metadata
        formData.append("name", file.name)
        formData.append("type", "file")
        if (currentFolder) {
          formData.append("parentId", currentFolder)
        }

        // Log FormData contents for debugging
        console.log("FormData contents:")
        for (const pair of formData.entries()) {
          console.log(pair[0], pair[1])
        }

        // Upload the file using your resource service
        return await resourceService.uploadResource(formData)
      })

      const newResources = await Promise.all(uploadPromises)
      setResources([...resources, ...newResources])
      setError(null)
    } catch (err) {
      console.error("Error uploading files:", err)
      setError("Failed to upload files. Please try again.")
    } finally {
      setLoading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // New functions for resource actions
  const toggleMenu = (e: React.MouseEvent, resourceId: string) => {
    e.stopPropagation() // Prevent folder opening when clicking the menu
    setActiveMenu(activeMenu === resourceId ? null : resourceId)
  }

  const handleDeleteResource = async (e: React.MouseEvent, resourceId: string) => {
    e.stopPropagation() // Prevent folder opening

    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        await resourceService.deleteResource(resourceId)
        setResources(resources.filter((r) => r.id !== resourceId))
        setActiveMenu(null)
      } catch (err) {
        console.error("Error deleting resource:", err)
        setError("Failed to delete resource. Please try again.")
      }
    }
  }

  const handleRenameResource = async (e: React.MouseEvent, resource: Resource) => {
    e.stopPropagation() // Prevent folder opening

    const newName = prompt("Enter new name:", resource.name)
    if (!newName || newName === resource.name) return

    try {
      const updatedResource = await resourceService.updateResource(resource.id, {
        name: newName,
      })

      setResources(resources.map((r) => (r.id === updatedResource.id ? updatedResource : r)))
      setActiveMenu(null)
    } catch (err) {
      console.error("Error renaming resource:", err)
      setError("Failed to rename resource. Please try again.")
    }
  }

  const handleViewFile = (e: React.MouseEvent | null, resource: Resource) => {
    // Only call stopPropagation if e is a valid event object
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }

    if (resource.type !== "file" || !resource.fileUrl) return;

    // Construct the URL to the file using the complete fileUrl path
    // The backend serves files directly from /uploads without going through /api
    const fileUrl = `http://localhost:3005${resource.fileUrl}`;
    
    console.log("Opening file:", fileUrl);
    
    // Open in a new tab
    window.open(fileUrl, "_blank");
    setActiveMenu(null);
  };

  // Filter resources by search query
  const filteredResources = resources.filter((resource) =>
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple />

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentFolder ? "Folder Contents" : "Study Resources"}
          </h1>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              onClick={handleUploadClick}
            >
              <Upload className="h-5 w-5" />
              <span>Upload</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-100"
              onClick={handleCreateFolder}
            >
              <FolderPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">New Folder</span>
            </motion.button>
          </div>
        </div>

        {/* Navigation path */}
        {currentFolder && (
          <button onClick={handleBackClick} className="text-primary-600 dark:text-primary-400 hover:underline">
            ← Back to parent folder
          </button>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">{error}</div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-100">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Filter</span>
          </button>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-12">
                No resources found. Create a new folder or upload files to get started.
              </div>
            ) : (
              filteredResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-dark-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
                  onClick={() => {
                    if (resource.type === "folder") {
                      handleFolderClick(resource.id);
                    } else {
                      // Pass null for the event to safely handle file viewing
                      handleViewFile(null, resource);
                    }
                  }}
                  style={{ cursor: resource.type === "folder" || resource.type === "file" ? "pointer" : "default" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {resource.type === "folder" ? (
                        <Folder className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <FileText className="h-10 w-10 text-gray-600 dark:text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{resource.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {resource.type === "folder" ? "Folder" : resource.fileSize || "File"}
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, resource.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-300"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === resource.id && (
                        <div
                          className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-dark-100 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {resource.type === "file" && (
                            <button
                              onClick={(e) => handleViewFile(e, resource)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </button>
                          )}
                          <button
                            onClick={(e) => handleRenameResource(e, resource)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => handleDeleteResource(e, resource.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-300 flex items-center"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Updated {new Date(resource.updatedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
