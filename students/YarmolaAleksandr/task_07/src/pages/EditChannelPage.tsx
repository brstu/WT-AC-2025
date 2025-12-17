import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, LoadingState, ErrorState } from '../shared/ui';
import { ChannelForm } from '../features/channels/ChannelForm';
import { useGetChannelQuery, useUpdateChannelMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { ChannelFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const EditChannelPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: channelResponse, error, isLoading: isFetching, refetch } = useGetChannelQuery(id!);
  const [updateChannel, { isLoading: isUpdating }] = useUpdateChannelMutation();

  const channel = channelResponse;

  const handleSubmit = async (data: ChannelFormData) => {
    if (!channel) return;

    try {
      await updateChannel({
        id: channel.id,
        channel: data,
      }).unwrap();

      toast.success('Channel updated successfully!');
      dispatch(addNotification({
        type: 'success',
        title: 'Channel Updated',
        message: `"${data.name}" has been updated`,
      }));

      navigate(`/channels/${channel.id}`);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      console.error('Error updating channel:', error);
      toast.error('Failed to update channel');
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error?.data?.message || 'Could not update the channel. Please try again.',
      }));
    }
  };

  if (isFetching) {
    return <LoadingState>Loading channel details...</LoadingState>;
  }

  if (error || !channel) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ErrorState
          title="Channel not found"
          message="The requested channel could not be found."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/channels/${channel.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Channel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Edit Channel</h1>
          <p className="text-muted-foreground">
            Update the details for "{channel.name}"
          </p>
        </CardHeader>
        <CardContent>
          <ChannelForm
            initialData={channel}
            onSubmit={handleSubmit}
            loading={isUpdating}
            submitText="Update Channel"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditChannelPage;