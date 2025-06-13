import type { UserDocument } from "@/types";

function compareObjectsByKey(key: string, ascending = true) {
  return function innerSort(objectA: any, objectB: any) {
    const valueA = key.split('.').reduce((o: any, i) => o[i], objectA);
    const valueB = key.split('.').reduce((o: any, i) => o[i], objectB);
    const sortValue = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return ascending ? sortValue : -1 * sortValue;
  };
}

export const sortDocuments = (documents: UserDocument[], sortkey: string, sortDirection: string) => {
  // Convert to document data representation for sorting
  const data = documents.map(d => {
    const docData = (d.local ?? d.cloud)!;
    
    // Check if the document has a sort_order (directly on local/cloud document or via directory property on cloud doc)
    const hasSortOrder = 
      d.cloud?.sort_order !== undefined || 
      d.local?.sort_order !== undefined ||
      d.cloud?.directory?.sort_order !== undefined;
      
    // Get sort_order with precedence: direct field first, then legacy directory property
    const sortOrder = 
      d.cloud?.sort_order ?? 
      d.local?.sort_order ??
      d.cloud?.directory?.sort_order ?? 
      null;
    
    return {
      ...docData,
      _hasSortOrder: hasSortOrder,
      _sortOrder: sortOrder
    };
  });

  // First, separate documents with and without sort_order
  const withSortOrder = data.filter(doc => doc._hasSortOrder);
  const withoutSortOrder = data.filter(doc => !doc._hasSortOrder);

  // Sort documents with sort_order by their sort_order value (always ascending)
  const sortedWithSortOrder = [...withSortOrder].sort((a, b) => {
    return (a._sortOrder ?? 0) - (b._sortOrder ?? 0);
  });

  // Sort the remaining documents by the specified key and direction
  const sortedWithoutSortOrder = [...withoutSortOrder].sort(
    compareObjectsByKey(sortkey, sortDirection === 'asc')
  );

  // Combine the two sorted arrays: first those with sort_order, then the rest
  const sortedData = [...sortedWithSortOrder, ...sortedWithoutSortOrder];
  
  // Map back to the original UserDocument objects
  const sortedDocuments = sortedData.map(docData => 
    documents.find(d => d.id === docData.id)!
  );
  
  return sortedDocuments;
};